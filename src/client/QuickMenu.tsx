/**
 * Quick-toggle menu: a small gear button at the right end of the composer
 * tool row (`conversation.input.right`) that switches to the native bar or
 * flips the plugin master switch and individual segments without opening
 * Settings. Shares the same config store as the bar and the settings page, so
 * every surface stays in sync live.
 */

import { memo, useRef, useState } from 'react'
import { IconSettingsOutlineRegular, Menu, type MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { SEGMENT_IDS, SEGMENT_META, resetConfig, toggleSegment, updateConfig, useStatusBarConfig } from './config.ts'
import { NS } from './locales.ts'

export type QuickMenuEntryProps =
  PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>

const MASTER_ID = 'dsb-master'
const NATIVE_ID = 'dsb-native'
const RESET_ID = 'dsb-reset'

export const QuickMenuEntry = memo(function QuickMenuEntry(props: QuickMenuEntryProps) {
  const config = useStatusBarConfig()
  const { t } = props
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement | null>(null)

  const items: MenuEntry[] = [
    { id: MASTER_ID, label: t('quick.master') },
    { id: NATIVE_ID, label: t('quick.native') },
    { type: 'separator', id: 'dsb-sep-1' },
    ...SEGMENT_IDS.map(id => ({
      id,
      label: t(SEGMENT_META[id].label),
    })),
    { type: 'separator', id: 'dsb-sep-2' },
    { id: RESET_ID, label: t('quick.reset') },
  ]

  // One mode is active at a time: native wins over the plugin master switch.
  const selectedIds = [
    ...(config.native ? [NATIVE_ID] : config.enabled ? [MASTER_ID] : []),
    ...config.segments,
  ]

  const onSelect = (id: string): void => {
    if (id === NATIVE_ID) {
      updateConfig({ native: !config.native })
    } else if (id === MASTER_ID) {
      // While native is active, choosing the plugin bar both leaves native
      // mode and turns the plugin bar on.
      updateConfig(config.native
        ? { native: false, enabled: true }
        : { enabled: !config.enabled })
    } else if (id === RESET_ID) {
      resetConfig()
    } else if ((SEGMENT_IDS as readonly string[]).includes(id)) {
      toggleSegment(id as (typeof SEGMENT_IDS)[number])
    }
  }

  return (
    <Menu
      open={open}
      anchor={(
        <div ref={anchorRef}>
          <button
            type="button"
            className="dsb-quick"
            title={t('quick.title')}
            aria-label={t('quick.title')}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <IconSettingsOutlineRegular size={14} />
          </button>
        </div>
      )}
      items={items}
      selectedIds={selectedIds}
      onSelect={onSelect}
      onClose={() => setOpen(false)}
      align="end"
      portal
      dense
    />
  )
})
