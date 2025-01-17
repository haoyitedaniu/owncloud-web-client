import { computed, ComputedRef, unref } from 'vue'
import { queryItemAsString } from 'web-pkg/src/composables/appDefaults'
import { useRouteQueryPersisted } from 'web-pkg/src/composables/router'
import { ViewModeConstants } from './constants'

export function useViewMode(options: ComputedRef<string>): ComputedRef<string> {
  if (options) {
    return computed(() => unref(options))
  }

  const viewModeQuery = useRouteQueryPersisted({
    name: ViewModeConstants.queryName,
    defaultValue: ViewModeConstants.defaultModeName
  })
  return computed(() => queryItemAsString(unref(viewModeQuery)))
}
