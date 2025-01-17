import { getParentPaths } from './path'
import { ShareTypes } from 'web-client/src/helpers/share'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

// dummy to trick gettext string extraction into recognizing strings
const $gettext = (str) => {
  return str
}

const $shareTypes = (resource) => {
  if (typeof resource.shareTypes !== 'undefined') {
    return resource.shareTypes
  }

  if (resource.shares) {
    return Array.from(new Set(resource.shares.map((share) => parseInt(share.type))))
  }

  return []
}

const isDirectUserShare = (resource) => {
  return ShareTypes.containsAnyValue(ShareTypes.authenticated, $shareTypes(resource))
}

const isIndirectUserShare = (resource, sharesTree, hasShareJail) => {
  return (
    (resource.isReceivedShare() && !hasShareJail) ||
    ShareTypes.containsAnyValue(
      ShareTypes.authenticated,
      shareTypesIndirect(resource.path, sharesTree)
    )
  )
}

const isDirectLinkShare = (resource) => {
  return ShareTypes.containsAnyValue(ShareTypes.unauthenticated, $shareTypes(resource))
}

const isIndirectLinkShare = (resource, sharesTree) => {
  return ShareTypes.containsAnyValue(
    ShareTypes.unauthenticated,
    shareTypesIndirect(resource.path, sharesTree)
  )
}

const isUserShare = (resource, sharesTree, hasShareJail) => {
  return isDirectUserShare(resource) || isIndirectUserShare(resource, sharesTree, hasShareJail)
}

const isLinkShare = (resource, sharesTree) => {
  return isDirectLinkShare(resource) || isIndirectLinkShare(resource, sharesTree)
}

const shareUserIconDescribedBy = (resource) => {
  return isDirectUserShare(resource)
    ? $gettext('This item is directly shared with others.')
    : $gettext('This item is shared with others through one of the parent folders.')
}

const shareLinkDescribedBy = (resource) => {
  return isDirectLinkShare(resource)
    ? $gettext('This item is directly shared via links.')
    : $gettext('This item is shared via links through one of the parent folders.')
}

const shareTypesIndirect = (path, sharesTree) => {
  const parentPaths = getParentPaths(path, true)

  if (parentPaths.length === 0) {
    return []
  }

  const shareTypes = {}

  parentPaths.forEach((parentPath) => {
    // TODO: optimize for performance by skipping once we got all known types
    const shares = sharesTree[parentPath]

    if (shares) {
      shares.forEach((share) => {
        // note: no distinction between incoming and outgoing shares as we display the same
        // indirect indicator for them
        shareTypes[share.shareType] = true
      })
    }
  })

  return Object.keys(shareTypes).map((shareType) => parseInt(shareType, 10))
}

// TODO: Think of a different way how to access sharesTree
export const getIndicators = (resource, sharesTree, hasShareJail = false) => {
  const indicators = [
    {
      id: `files-sharing-${resource.getDomSelector()}`,
      accessibleDescription: shareUserIconDescribedBy(resource),
      label: $gettext('Show invited people'),
      visible: isUserShare(resource, sharesTree, hasShareJail),
      icon: 'group',
      target: 'sharing',
      type: isDirectUserShare(resource) ? 'user-direct' : 'user-indirect',
      handler: (resource, panel) => {
        eventBus.publish(SideBarEventTopics.openWithPanel, `${panel}#peopleShares`)
      }
    },
    {
      id: `file-link-${resource.getDomSelector()}`,
      accessibleDescription: shareLinkDescribedBy(resource),
      label: $gettext('Show links'),
      visible: isLinkShare(resource, sharesTree),
      icon: 'link',
      target: 'sharing',
      type: isDirectLinkShare(resource) ? 'link-direct' : 'link-indirect',
      handler: (resource, panel) => {
        eventBus.publish(SideBarEventTopics.openWithPanel, `${panel}#linkShares`)
      }
    }
  ]

  return indicators.filter((indicator) => indicator.visible)
}
