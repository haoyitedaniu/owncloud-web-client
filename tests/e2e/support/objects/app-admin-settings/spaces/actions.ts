import { Page } from 'playwright'
import util from 'util'

const spaceTrSelector = 'tr'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const spaceIdSelector = `[data-item-id="%s"] .spaces-table-btn-action-dropdown`
const quotaActionBtn = `.oc-files-actions-edit-quota-trigger`
const disableActionBtn = `.oc-files-actions-disable-trigger`
const deleteActionBtn = `.oc-files-actions-delete-trigger`
const modalConfirmBtn = `.oc-modal-body-actions-confirm`
const quotaValueDropDown = `.vs__dropdown-option :text-is("%s")`
const selectedQuotaValueField = '.vs__dropdown-toggle'
const spacesQuotaSearchField = '.oc-modal .vs__search'

export const getDisplayedSpaces = async (page): Promise<string[]> => {
  const spaces = []
  const result = page.locator(spaceTrSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    spaces.push(await result.nth(i).getAttribute('data-item-id'))
  }

  return spaces
}

export const changeSpaceQuota = async (args: {
  page: Page
  id: string
  value: string
}): Promise<void> => {
  const { page, value, id } = args
  await page.locator(util.format(spaceIdSelector, id)).click()
  await page.waitForSelector(quotaActionBtn)
  await page.locator(quotaActionBtn).click()

  const searchLocator = await page.locator(spacesQuotaSearchField)
  await searchLocator.fill(value)
  await page.waitForSelector(selectedQuotaValueField)
  await page.locator(util.format(quotaValueDropDown, value)).click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(actionConfirmButton).click()
  ])
}

export const disableSpace = async (args: { page: Page; id: string }): Promise<void> => {
  const { page, id } = args
  await page.locator(util.format(spaceIdSelector, id)).click()
  await page.waitForSelector(disableActionBtn)
  await page.locator(disableActionBtn).click()
  await page.waitForSelector(modalConfirmBtn)

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 204 &&
        resp.request().method() === 'DELETE'
    ),
    page.locator(modalConfirmBtn).click()
  ])
}

export const deleteSpace = async (args: { page: Page; id: string }): Promise<void> => {
  const { page, id } = args
  await page.locator(util.format(spaceIdSelector, id)).click()
  await page.waitForSelector(deleteActionBtn)
  await page.locator(deleteActionBtn).click()
  await page.waitForSelector(modalConfirmBtn)

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 204 &&
        resp.request().method() === 'DELETE'
    ),
    page.locator(modalConfirmBtn).click()
  ])
}
