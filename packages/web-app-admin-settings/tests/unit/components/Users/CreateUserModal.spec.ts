import CreateUserModal from '../../../../src/components/Users/CreateUserModal.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('CreateUserModal', () => {
  describe('computed method "isFormInvalid"', () => {
    it('should be true if any data set is invalid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.formData.userName.valid = false
      expect(wrapper.vm.isFormInvalid).toBeTruthy()
    })
  })
  it('should be false if no data set is invalid', () => {
    const { wrapper } = getWrapper()
    Object.keys(wrapper.vm.formData).forEach((key) => {
      wrapper.vm.formData[key].valid = true
    })
    expect(wrapper.vm.isFormInvalid).toBeFalsy()
  })

  describe('method "validateUserName"', () => {
    it('should be false when userName is empty', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = ''
      expect(wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be false when userName contains white spaces', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = 'jan owncCloud'
      expect(wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be false when userName starts with a numeric value', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = '1moretry'
      expect(wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be false when userName is already existing', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = 'jan'
      expect(wrapper.vm.validateUserName()).toBeFalsy()
    })
    it('should be true when userName is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.onPremisesSamAccountName = 'jana'
      expect(wrapper.vm.validateUserName()).toBeTruthy()
    })
  })

  describe('method "validateDisplayName"', () => {
    it('should be false when displayName is empty', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.displayName = ''
      expect(wrapper.vm.validateDisplayName()).toBeFalsy()
    })
    it('should be true when displayName is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.displayName = 'jana'
      expect(wrapper.vm.validateDisplayName()).toBeTruthy()
    })
  })

  describe('method "validateEmail"', () => {
    it('should be false when email is invalid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.mail = 'jana@'
      expect(wrapper.vm.validateEmail()).toBeFalsy()
    })

    it('should be true when email is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.mail = 'jana@owncloud.com'
      expect(wrapper.vm.validateEmail()).toBeTruthy()
    })
  })

  describe('method "validatePassword"', () => {
    it('should be false when password is empty', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.passwordProfile.password = ''
      expect(wrapper.vm.validatePassword()).toBeFalsy()
    })

    it('should be true when password is valid', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.user.passwordProfile.password = 'asecret'
      expect(wrapper.vm.validatePassword()).toBeTruthy()
    })
  })
})

function getWrapper() {
  return {
    wrapper: shallowMount(CreateUserModal, {
      props: {
        cancel: jest.fn(),
        confirm: jest.fn(),
        existingUsers: [
          {
            onPremisesSamAccountName: 'jan'
          }
        ]
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
