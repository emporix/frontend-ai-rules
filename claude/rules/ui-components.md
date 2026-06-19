---
paths:
  - "src/components/**"
  - "src/pages/**"
---

# UI Components

## Structure

- One component per folder or pair: `ComponentName.tsx` + `ComponentName.module.scss`
- Section components: `*Section.tsx` in `sections/` or feature subfolders
- Icons: dedicated files under `icons/` with configurable `width`, `height`, `color`
- Prefer project-specific shared components in `common/` over duplicating patterns

## Example: Presentational dialog

Pattern from shared confirm dialogs — props in, events out, library buttons, CSS Modules:

```typescript
// src/components/common/ActionConfirmDialog.tsx
import { useTranslation } from 'react-i18next'
import { Dialog } from 'primereact/dialog'
import { PrimaryButton, SecondaryButton } from '@emporix/component-library'
import styles from './ActionConfirmDialog.module.scss'

type ActionConfirmDialogProps = {
  readonly isOpen: boolean
  readonly title: string
  readonly messageKey?: string
  readonly acceptLabel: string
  readonly rejectLabel: string
  readonly isLoading: boolean
  readonly isAcceptDisabled?: boolean
  readonly onAccept: () => void
  readonly onReject: () => void
  readonly children?: React.ReactNode
}

const ActionConfirmDialog = (props: Readonly<ActionConfirmDialogProps>) => {
  const { t } = useTranslation()

  return (
    <Dialog visible={props.isOpen} onHide={props.onReject} header={props.title}>
      {props.messageKey ? (
        <div className={styles.content}>{t(props.messageKey)}</div>
      ) : null}
      {props.children}
      <div className={styles.buttonContainer}>
        <SecondaryButton onClick={props.onReject} disabled={props.isLoading}>
          {props.rejectLabel}
        </SecondaryButton>
        <PrimaryButton
          onClick={props.onAccept}
          loading={props.isLoading}
          disabled={props.isLoading || (props.isAcceptDisabled ?? false)}
        >
          {props.acceptLabel}
        </PrimaryButton>
      </div>
    </Dialog>
  )
}

export default ActionConfirmDialog
```

## Example: Container with local UI state + confirmation

Pattern from destructive actions — dialog state stays in the component; domain delete is injected via prop:

```typescript
// src/components/order-list/BulkDeleteButton.tsx
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InputText, SecondaryButton } from '@emporix/component-library'
import ActionConfirmDialog from '../common/ActionConfirmDialog'
import styles from './BulkDeleteButton.module.scss'

type BulkDeleteButtonProps = {
  readonly selectedCount: number
  readonly selectedNames: string[]
  readonly onDelete: () => Promise<void>
}

const BulkDeleteButton = ({
  selectedCount,
  selectedNames,
  onDelete,
}: BulkDeleteButtonProps) => {
  const { t } = useTranslation()
  const confirmationInputId = useId()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')

  const confirmationPhrase = t('orderList.deleteConfirm.confirmationPhrase')
  const isConfirmationValid = confirmationInput.trim() === confirmationPhrase

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete()
      setConfirmationInput('')
      setIsDialogOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SecondaryButton
        onClick={() => setIsDialogOpen(true)}
        disabled={selectedCount === 0}
      >
        {t('global.delete')}
        {selectedCount > 0 ? ` (${selectedCount})` : ''}
      </SecondaryButton>
      <ActionConfirmDialog
        isOpen={isDialogOpen}
        title={t('orderList.deleteConfirm.title')}
        acceptLabel={t('global.delete')}
        rejectLabel={t('global.cancel')}
        isLoading={isLoading}
        isAcceptDisabled={!isConfirmationValid}
        onAccept={handleDelete}
        onReject={() => {
          setConfirmationInput('')
          setIsDialogOpen(false)
        }}
      >
        <label className={styles.inputLabel} htmlFor={confirmationInputId}>
          {t('orderList.deleteConfirm.inputLabel', { phrase: confirmationPhrase })}
        </label>
        <InputText
          inputId={confirmationInputId}
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
          placeholder={confirmationPhrase}
        />
      </ActionConfirmDialog>
    </>
  )
}

export default BulkDeleteButton
```

## Example: Section component props

```typescript
type OrderDetailsSectionProps = {
  readonly orderId: string
  readonly isReadOnly?: boolean
  readonly onFieldChange: (field: 'name' | 'notes', value: string) => void
}
```

Extend with feature-specific readonly fields. Never mutate props.

## Styling

- CSS Modules with descriptive, BEM-like class names
- Use design tokens / CSS variables when the project defines them
- Interactive buttons: reset browser defaults, add `:focus-visible` outline
- Convert clickable divs to `<button type="button">` with style reset

```scss
// ActionConfirmDialog.module.scss
.buttonContainer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.content {
  margin-bottom: 1rem;
}
```

## Do's and Don'ts

### Structure

| Do | Don't |
|----|-------|
| Split presentational (`ActionConfirmDialog`) and container (`BulkDeleteButton`) components | One 300-line component with dialog + list + API calls |
| Colocate `ComponentName.module.scss` with the component | Put feature styles in a global `.scss` file |
| Use `sections/` for form chunks (`CustomerSection.tsx`) | Inline large JSX blocks in page components |

### Props and state

| Do | Don't |
|----|-------|
| `readonly` on every prop | `props.order.items.push(…)` |
| Local state for UI only (`isDialogOpen`, `isLoading`) | Duplicate server/model data in `useState` |
| Inject async work via `onDelete: () => Promise<void>` | Call `fetch('/api/…')` directly inside a shared dialog |

```typescript
// ✅ Do — specific confirmation copy
title={t('orderList.deleteConfirm.title')}

// ❌ Don't — generic dialog text
title="Are you sure?"
```

### Accessibility, i18n, and libraries

| Do | Don't |
|----|-------|
| `<label htmlFor={id}>` with matching `inputId` | Placeholder-only inputs with no label |
| `<button type="button">` for non-submit actions | `<div onClick={…}>` for primary actions |
| Semantic HTML (`nav`, `main`, `label`); visible `:focus-visible` | Missing `aria-label` when there is no visible text |

Translation keys and `useTranslation()` — see **`i18n`** rule. Buttons, toasts, and inputs — see **`emporix-component-library`** rule. PrimeReact widgets — see **`primereact`** rule.

When the project uses Storybook, new or changed components need `*.stories.tsx` covering default, loading, error, and edge-case states.
