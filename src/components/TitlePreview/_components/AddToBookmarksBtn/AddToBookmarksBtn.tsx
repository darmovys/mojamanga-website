import { TitlePreviewData } from '@/services/queries'
import { Collapsible, Button, ScrollArea, Input } from '@base-ui/react'
import {
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  PlusIcon,
} from 'lucide-react'
import VisuallyHidden from '@/components/VisuallyHidden'
import { BOOKMARK_SYSTEM_FOLDERS_DATA } from '@/lib/constants'
import { useAddToBookmarks } from './use-add-to-bookmarks'
import styles from './AddToBookmarksBtn.module.scss'

interface AddToBookmartkBtnProps {
  bookmarkFolders: TitlePreviewData['bookmarkFolders']
  activeFolder: TitlePreviewData['activeFolder']
  titleId: string
}

export function AddToBookmartkBtn({
  activeFolder,
  bookmarkFolders,
  titleId,
}: AddToBookmartkBtnProps) {
  const {
    isUpdating,
    isPendingSessionData,
    isLoggedIn,
    isEnterMode,
    folderName,
    newFolderFieldRef,
    clear,
    setFolderName,
    setIsEnterMode,
    handleAddNewFolder,
    handleAddToPlans,
    handleDeleteBookmark,
    handleSelect,
  } = useAddToBookmarks({ activeFolder, bookmarkFolders, titleId })

  return (
    <Collapsible.Root className={styles.CollapsibleRoot}>
      <div className={styles.TriggerBar}>
        {activeFolder ? (
          <Collapsible.Trigger
            className={styles.TriggerMain}
            render={
              <Button focusableWhenDisabled={true} disabled={isUpdating} />
            }
            style={
              {
                '--color': activeFolder.isSystem
                  ? BOOKMARK_SYSTEM_FOLDERS_DATA[activeFolder.systemType].color
                  : activeFolder.color,
              } as React.CSSProperties
            }
          >
            {isUpdating ? (
              <LoaderCircleIcon
                size={20}
                className={styles.TriggerTextIcon}
                data-loading={isUpdating ? '' : undefined}
              />
            ) : (
              <BookmarkIcon size={20} className={styles.TriggerTextIcon} />
            )}
            <span className={styles.TriggerText}>
              {activeFolder.isSystem
                ? BOOKMARK_SYSTEM_FOLDERS_DATA[activeFolder.systemType].label
                : activeFolder.name}
            </span>
          </Collapsible.Trigger>
        ) : (
          <Button
            className={styles.TriggerMainEmpty}
            onClick={handleAddToPlans}
            focusableWhenDisabled={true}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <LoaderCircleIcon
                size={20}
                className={styles.TriggerTextIcon}
                data-loading={isUpdating ? '' : undefined}
              />
            ) : (
              <PlusIcon size={20} className={styles.TriggerTextIcon} />
            )}
            <span className={styles.TriggerText}>Додати в плани</span>
          </Button>
        )}

        <div className={styles.TriggerDivider} />

        <Collapsible.Trigger
          render={
            <Button
              focusableWhenDisabled={true}
              disabled={isUpdating || isPendingSessionData}
              onClick={clear}
            />
          }
          className={styles.TriggerChevronWrapper}
        >
          <ChevronDownIcon size={22} className={styles.TriggerChevron} />
          <VisuallyHidden>Відкрити список папок</VisuallyHidden>
        </Collapsible.Trigger>
      </div>

      {/* Випадаючий список */}
      <Collapsible.Panel className={styles.CollapsiblePanel}>
        <div className={styles.PanelContent}>
          <ScrollArea.Root className={styles.ScrollAreaRoot}>
            <ScrollArea.Viewport className={styles.ScrollAreaViewport}>
              {isLoggedIn ? (
                <div className={styles.FolderList}>
                  {bookmarkFolders?.map((folder) => {
                    const isSelected = folder.id === activeFolder?.id
                    return (
                      <Button
                        key={folder.id}
                        focusableWhenDisabled={true}
                        disabled={isUpdating}
                        className={styles.FolderItem}
                        data-selected={isSelected ? '' : undefined}
                        onClick={() => handleSelect(folder.id)}
                      >
                        {folder.isSystem
                          ? BOOKMARK_SYSTEM_FOLDERS_DATA[folder.systemType]
                              .label
                          : folder.name}
                        {isSelected && <CheckIcon size={16} />}
                      </Button>
                    )
                  })}
                  {activeFolder && (
                    <Button
                      disabled={isUpdating}
                      className={styles.DeleteBookmarkButton}
                      onClick={handleDeleteBookmark}
                    >
                      Прибрати закладку
                    </Button>
                  )}
                </div>
              ) : (
                <p className={styles.AuthWarning}>
                  Необхідно авторизуватися, щоб додавати твори до закладок
                </p>
              )}
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
              className={styles.Scrollbar}
              orientation="vertical"
            >
              <ScrollArea.Thumb className={styles.ScrollbarThumb} />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          {/* Нижня кнопка додавання папки */}
          {isLoggedIn && (
            <div
              className={styles.BottomPanelSection}
              data-enter-mode={isEnterMode ? '' : undefined}
            >
              {!isEnterMode ? (
                <Button
                  className={styles.EnterEditModeButton}
                  disabled={isUpdating}
                  onClick={() => {
                    setIsEnterMode(true)
                  }}
                >
                  <span>Створити нову папку</span>
                  <PlusIcon className={styles.PlusIcon} />
                </Button>
              ) : (
                <form
                  className={styles.AddNewFolderForm}
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddNewFolder()
                  }}
                >
                  <Input
                    className={styles.FieldInput}
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    autoComplete="off"
                    placeholder="Введіть назву папки"
                    ref={newFolderFieldRef}
                    id="add-new-folder-field"
                    disabled={isUpdating}
                    autoFocus={true}
                  />
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className={styles.AddNewFolderButton}
                  >
                    <PlusIcon className={styles.PlusIcon} />
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}
