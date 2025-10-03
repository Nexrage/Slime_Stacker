# Gluestack UI - Project Reference

Links

- Button: https://gluestack.io/ui/docs/components/button
- Box: https://gluestack.io/ui/docs/components/box
- HStack: https://gluestack.io/ui/docs/components/hstack
- VStack: https://gluestack.io/ui/docs/components/vstack

Provider setup

- Wrap app with GluestackUIProvider using config from @gluestack-ui/config

Button

- Structure: <Button><ButtonText>Label</ButtonText></Button>
- Import from @gluestack-ui/themed: Button, ButtonText

Box

- Use RN style for backgroundColor, padding, margin (e.g., style={{ backgroundColor: '#000' }})
- Supported layout props: flex, alignItems, justifyContent

HStack / VStack

- Use for horizontal/vertical layout with alignItems/justifyContent
- Prefer explicit spacing via per-child margin styles for reliability in this project setup

Project conventions

- Avoid shorthands like bg, px, mb, space/gap unless types allow; prefer style={{ ... }}
- Keep all Gluestack components wrapped by GluestackUIProvider config

---

## Component Index (docs)

- Accordion: https://gluestack.io/ui/docs/components/accordion
- Actionsheet: https://gluestack.io/ui/docs/components/actionsheet
- Alert: https://gluestack.io/ui/docs/components/alert
- AlertDialog: https://gluestack.io/ui/docs/components/alert-dialog
- Avatar: https://gluestack.io/ui/docs/components/avatar
- Badge: https://gluestack.io/ui/docs/components/badge
- Box: https://gluestack.io/ui/docs/components/box
- Button: https://gluestack.io/ui/docs/components/button
- Checkbox: https://gluestack.io/ui/docs/components/checkbox
- Divider: https://gluestack.io/ui/docs/components/divider
- Fab: https://gluestack.io/ui/docs/components/fab
- FormControl: https://gluestack.io/ui/docs/components/form-control
- HStack: https://gluestack.io/ui/docs/components/hstack
- Icon: https://gluestack.io/ui/docs/components/icon
- Image: https://gluestack.io/ui/docs/components/image
- Input: https://gluestack.io/ui/docs/components/input
- Link: https://gluestack.io/ui/docs/components/link
- Menu: https://gluestack.io/ui/docs/components/menu
- Modal: https://gluestack.io/ui/docs/components/modal
- Overlay: https://gluestack.io/ui/docs/components/overlay
- Popover: https://gluestack.io/ui/docs/components/popover
- Pressable: https://gluestack.io/ui/docs/components/pressable
- Progress: https://gluestack.io/ui/docs/components/progress
- Radio: https://gluestack.io/ui/docs/components/radio
- Select: https://gluestack.io/ui/docs/components/select
- Slider: https://gluestack.io/ui/docs/components/slider
- Spinner: https://gluestack.io/ui/docs/components/spinner
- Switch: https://gluestack.io/ui/docs/components/switch
- Tabs: https://gluestack.io/ui/docs/components/tabs
- Textarea: https://gluestack.io/ui/docs/components/textarea
- Toast: https://gluestack.io/ui/docs/components/toast
- Tooltip: https://gluestack.io/ui/docs/components/tooltip
- VStack: https://gluestack.io/ui/docs/components/vstack
