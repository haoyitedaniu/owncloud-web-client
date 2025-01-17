import { DataTable, Then, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { expect } from '@playwright/test'

When(
  '{string} navigates to the project spaces management page',
  async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const pageObject = new objects.applicationAdminSettings.page.Spaces({ page })
    await pageObject.navigate()
  }
)

Then(
  /^"([^"]*)" (should|should not) see the following space(s)?$/,
  async function (
    this: World,
    stepUser: string,
    actionType: string,
    _: string,
    stepTable: DataTable
  ): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
    const actualList = await spacesObject.getDisplayedSpaces()

    for (const info of stepTable.hashes()) {
      const space = await spacesObject.getSpace({ key: info.id })
      const found = actualList.includes(space.id)
      if (actionType === 'should') {
        expect(found).toBe(true)
      } else {
        expect(found).toBe(false)
      }
    }
  }
)

When(
  /^"([^"]*)" updates the quota for space "([^"]*)" to "([^"]*)"$/,
  async function (this: World, stepUser: string, key: string, value: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })
    await spacesObject.changeQuota({ key, value })
  }
)

When(
  /^"([^"]*)" (disables|deletes) the space "([^"]*)"$/,
  async function (this: World, stepUser: string, action: string, key: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const spacesObject = new objects.applicationAdminSettings.Spaces({ page })

    switch (action) {
      case 'disables':
        await spacesObject.disable({ key })
        break
      case 'deletes':
        await spacesObject.delete({ key })
        break
      default:
        throw new Error(`${action} not implemented`)
    }
  }
)
