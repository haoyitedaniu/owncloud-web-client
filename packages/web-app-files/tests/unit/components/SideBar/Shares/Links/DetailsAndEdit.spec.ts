import DetailsAndEdit from 'web-app-files/src/components/SideBar/Shares/Links/DetailsAndEdit.vue'
import { LinkShareRoles } from 'web-client/src/helpers/share'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'

const availableRoleOptions = LinkShareRoles.list(false, true, true)

const exampleLink = {
  name: 'Example link',
  url: 'https://some-url.com/abc',
  permissions: 1
}

describe('DetailsAndEdit component', () => {
  describe('if user can not edit', () => {
    it('does not render dropdown or edit button', () => {
      const { wrapper } = getShallowMountedWrapper(exampleLink)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('if user can edit', () => {
    it('renders dropdown and edit button', () => {
      const { wrapper } = getShallowMountedWrapper(exampleLink, false, true)
      expect(wrapper.html()).toMatchSnapshot()
    })

    it.todo('test edit options, button clicks and event handling/propagation')
  })
})

function getShallowMountedWrapper(link, expireDateEnforced = false, isModifiable = false) {
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(DetailsAndEdit, {
      props: {
        availableRoleOptions,
        canRename: true,
        expirationDate: {
          enforced: expireDateEnforced,
          default: null,
          min: 'Wed Apr 01 2020 00:00:00 GMT+0000 (Coordinated Universal Time)',
          max: null
        },
        link,
        isModifiable,
        isPasswordEnforced: false,
        file: mockDeep<Resource>()
      },
      global: {
        renderStubDefaultSlot: true,
        stubs: { OcDatepicker: false, 'date-picker': true },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
