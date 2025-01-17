import { shallowMount, mount, defaultPlugins } from 'web-test-helpers'
import OcTextInput from './OcTextInput.vue'

const defaultProps = {
  label: 'label'
}

describe('OcTextInput', () => {
  function getShallowWrapper(props = {}) {
    return shallowMount(OcTextInput, {
      props: {
        ...defaultProps,
        ...props
      },
      global: { plugins: [...defaultPlugins()] }
    })
  }

  function getMountedWrapper(options = {}) {
    return mount(OcTextInput, {
      ...options,
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }

  const selectors = {
    textInputMessage: '.oc-text-input-message span',
    clearInputButton: '.oc-text-input-btn-clear',
    inputField: '.oc-text-input'
  }

  describe('id prop', () => {
    const wrapper = getShallowWrapper({ id: 'test-input-id', descriptionMessage: 'hello' })
    it('should set provided id to the input', () => {
      expect(wrapper.find('input').attributes().id).toBe('test-input-id')
    })
    it('should set label target for provided id', () => {
      expect(wrapper.find('label').attributes().for).toBe('test-input-id')
    })
    it('should set message id according to provided id', () => {
      expect(wrapper.find(selectors.textInputMessage).attributes().id).toBe('test-input-id-message')
    })
  })

  describe('label prop', () => {
    it('should set provided label to the input', () => {
      const wrapper = getShallowWrapper()
      expect(wrapper.find('label').text()).toBe('label')
    })
  })

  describe('when a description message is provided', () => {
    const wrapper = getShallowWrapper({ descriptionMessage: 'You should pass.' })
    it('should add the description class to the input message', () => {
      expect(wrapper.find(selectors.textInputMessage).attributes().class).toContain(
        'oc-text-input-description'
      )
    })
    it('should show the description message as the input message text', () => {
      expect(wrapper.find(selectors.textInputMessage).text()).toBe('You should pass.')
    })
  })

  describe('when a warning message is provided', () => {
    const wrapper = getShallowWrapper({ warningMessage: 'You may pass.' })
    it('should add the warning class to the input', () => {
      expect(wrapper.find('input').attributes().class).toContain('oc-text-input-warning')
    })
    it('should add the warning class to the input message', () => {
      expect(wrapper.find(selectors.textInputMessage).attributes().class).toContain(
        'oc-text-input-warning'
      )
    })
    it('should show the warning message as the input message text', () => {
      expect(wrapper.find(selectors.textInputMessage).text()).toBe('You may pass.')
    })
  })

  describe('when an error message is provided', () => {
    const wrapper = getShallowWrapper({ errorMessage: 'You shall not pass.' })
    it('should add the error class to the input', () => {
      expect(wrapper.find('input').attributes().class).toContain('oc-text-input-danger')
    })
    it('should add the error class to the input message', () => {
      expect(wrapper.find(selectors.textInputMessage).attributes().class).toContain(
        'oc-text-input-danger'
      )
    })
    it('should show the error message as the input message text', () => {
      expect(wrapper.find(selectors.textInputMessage).text()).toBe('You shall not pass.')
    })
    it('should set the input aria-invalid attribute to true', () => {
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })
  })

  describe('message priority', () => {
    it('should give error message top priority', () => {
      const wrapper = getShallowWrapper({
        errorMessage: 'You shall not pass.',
        warningMessage: 'You may pass.',
        descriptionMessage: 'Your should pass.'
      })
      const messageEl = wrapper.find('.oc-text-input-message span')
      expect(messageEl.attributes().class).toBe(
        'oc-text-input-description oc-text-input-warning oc-text-input-danger'
      )
      expect(messageEl.text()).toBe('You shall not pass.')
    })
    it('should give waring message priority over description message', () => {
      const wrapper = getShallowWrapper({
        warningMessage: 'You may pass.',
        descriptionMessage: 'Your should pass.'
      })
      const messageEl = wrapper.find(selectors.textInputMessage)
      expect(messageEl.attributes().class).toBe('oc-text-input-description oc-text-input-warning')
      expect(messageEl.text()).toBe('You may pass.')
    })
  })

  describe('type prop', () => {
    // FIXME: validation does not work
    it.skip('should only allow text, number, email and password as type', () => {
      expect(() => {
        getShallowWrapper({ type: 'binary' })
      }).toThrow('[Vue warn]: Invalid prop: custom validator check failed for prop "type".')
    })
    it.each(['text', 'number', 'email', 'password'])(
      'should set the provided type for the input',
      (type) => {
        const wrapper = getShallowWrapper({ type: type })
        expect(wrapper.find('input').attributes('type')).toBe(type)
      }
    )
  })

  describe('input events', () => {
    it('should emit an input event on typing', async () => {
      const wrapper = getShallowWrapper()
      expect(wrapper.emitted().input).toBeFalsy()
      await wrapper.find('input').setValue('a')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('a')
    })
  })

  describe('clear-button accessible label prop', () => {
    it('should set the aria label attribute if provided', () => {
      const wrapper = getShallowWrapper({
        clearButtonEnabled: true,
        modelValue: 'non-empty-value',
        clearButtonAccessibleLabel: 'test label'
      })
      expect(wrapper.find(selectors.clearInputButton).attributes().arialabel).toBe('test label')
    })
  })

  describe('clear input', () => {
    it('has no clear button when it is disabled', () => {
      const wrapper = getShallowWrapper({
        modelValue: 'non-empty-value',
        clearButtonEnabled: true,
        disabled: true
      })
      expect(wrapper.find(selectors.clearInputButton).exists()).toBeFalsy()
    })

    it('has clear button when it is enabled but the input is an empty string but not null', () => {
      const wrapper = getShallowWrapper({
        clearButtonEnabled: true,
        modelValue: ''
      })

      expect(wrapper.find(selectors.clearInputButton).exists()).toBeTruthy()
    })

    it('has no clear button when it is enabled but the input is null', () => {
      const wrapper = getShallowWrapper({
        clearButtonEnabled: true,
        modelValue: null
      })

      expect(wrapper.find(selectors.clearInputButton).exists()).toBeFalsy()
    })

    it('has a clear button when it is enabled and the input contains content', () => {
      const wrapper = getShallowWrapper({
        clearButtonEnabled: true,
        modelValue: 'non-empty-value'
      })

      const btn = wrapper.find(selectors.clearInputButton)
      expect(btn.exists()).toBeTruthy()
    })

    it('clears the content on click', async () => {
      const wrapper = getMountedWrapper({
        props: {
          ...defaultProps,
          clearButtonEnabled: true,
          modelValue: 'non-empty-value'
        },
        attachTo: document.body
      })

      const btn = wrapper.find(selectors.clearInputButton)
      const input = wrapper.find(selectors.inputField)

      await btn.trigger('click')

      // value as data is supposed to be `null`
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(null)
      // value in DOM would be the empty string if two way binding was used
      // by just passing in the value it should remain unchanged
      expect((input.element as HTMLInputElement).value).toEqual('non-empty-value')
      expect(document.activeElement.id).toBe(input.element.id)
    })
  })
})
