## 2.7.0

-   Update dependencies
-   Clean-up internal API
-   s\/Atom-Typescript\/IDE-Haskell\/g
-   Open tooltip links via ide-haskell-hoogle

## 2.6.0

-   Pointer-events on tooltips
-   Tweak styles
-   More sensible registry defaults
-   Untie actions from tooltips
-   Initial support for standalone actions
-   Fix select list focus issues
-   Factor out action rendering
-   Better actions support
-   Crude actions support

## 2.5.0

-   Attach source data to tooltip
-   Bundle distribution (faster load times, smaller footprint)
-   Move backend status to separate module
-   Optimize default tabs creation
-   Make output panel tabs disposable
-   Handle promises appropriately
-   \[UPI\] Add declarative-style commands
-   Minor fixes

## 2.4.1

-   Limit what results are cleared on message provider reported severities
-   Do not recreate already existing result markers

## 2.4.0

-   Allow UPI declarative events to return check results
-   Use atom-ts-spec-runner

## 2.3.1

-   Raise progress priority to always show it

    Before, progress indicator wouldn't be shown when any component
    reported errors or warnings. Progress indicator priority has been
    raised to always show it when an operation is in progress.

-   Show progress status for declarative events

    Some events, like mouseover type tooltip, didn't always show
    progress indicator correctly.

## 2.3.0

-   Bump dependencies. Minimal Atom version is 1.24
-   Use HTML progress element for progress bar

    This makes it a little bit more consistent with the style guide.

-   Add configuration option for buttons position

    Whereas before buttons (Error/Warning/Lint/etc) position was defined
    by whether the panel is positioned in bottom dock or left/right one,
    now the behavior is controlled by a configuration option
    `ide-haskell.buttonsPosition`, 'Panel buttons position', which can
    be either 'top' (the default) or 'left'.

## 2.2.3

-   Fix for
    <https://github.com/atom-haskell/ide-haskell-cabal/issues/20>
    -   Group fast-firing messages for purposes of `switchTabOnCheck`
    -   Do not rely on severities ordering when deciding which tab to
        switch to if `switchTabOnCheck` is enabled
-   Code cleanup (strict boolean expressions)
-   Pin node types version
-   Move config schema to package.json
-   Add Travis CI builds
-   Add the most basic tests
-   Bump Atom version

## 2.2.2

-   Update atom typings; bump devDependencies
-   Add lodash to dependencies

## 2.2.1

-   Show currently-selected param value
-   Remove unnecessary `bind`s
-   Remove now-unnecessary onWillSave prettifier hack
-   Removed code duplication
-   Update license information
-   Hide MessageObject from UPI
-   Do not create error/warning/lint tabs if not using builtin frontend
-   Do not show ide-haskell panel when switchTabOnCheck if no messages
-   Migrate to Linter V2
-   Migrate to new typings

## 2.2.0

-   Dispatch appropriate settings on editor's root scope (refer to
    [ide-haskell
    documentation](https://atom-haskell.github.io/core-packages/ide-haskell/#advanced-configuration-since-v2-2-0)
    for more information)
-   Individual prettify-on-save toggles **possibly breaking defaults if
    using prettify-on-save, check ide-haskell settings** (\#216)
-   Move ide-haskell class mark to separate controller; Mark all full
    language-haskell grammars with ide-haskell class
-   More strict grammar match for editorControl
-   Enable checkResults gutter on all full language-haskell grammars
-   Simplify tab item count (now ignores URI filter)

## 2.1.1

-   Rework outputPanel, defer initialization until package is active
    (fixes problems introduced in 2.1.0 by panel deserialization, which
    happens before package activation)
-   Avoid bind(this)
-   Search all panes on item position click

## 2.1.0

-   Serialize panel position
-   Don't hide panel if it's not in dock
-   Remove extraneous commas from setting descriptions

## 2.0.5

-   Await package activation before trying to get configParams
-   Enforce code style

## 2.0.4

-   Handle exceptions in imperative tooltips
-   Rewrite UPI2 as a thin adapter to UPI3
-   Freeze UPI2 types in def.d.ts
-   Better typings.

## 2.0.3

-   Avoid duplicate prettifier messages
-   Resave after prettify
-   Change titles of prettifier-related settings
-   Use typings-provided IEventDesc
-   Typed emitter
-   bump submodules

## 2.0.2

-   Fix \#210
-   Update typings

## 2.0.1

-   Fix prettify-on-save

## 2.0.0

-   New internal architecture (hopefully more robust)
-   Added statusbar icon to show status & to hide/show panel
-   Minimal Atom version required is 1.19
-   Panel uses Atom docks
-   Dropped space-pen dependency (using
    [atom-select-list](https://github.com/atom/atom-select-list)
    instead)
-   Whole thing rewritten in TypeScript
-   Using [etch](https://github.com/atom/etch/) for UI
-   Separate statuses for plugins
-   UPI 0.3
-   Universal atom-linter support
-   Autocomplete hint toolitps support

## 1.9.6

-   Use Atom tooltips for panel elements
-   Fix \#197

## 1.9.5

-   Fix ParamSelectView filter key error

## 1.9.4

-   Fix \#192
-   Add IRC chat info
-   Removed gitter badge

## 1.9.3

-   Use atom-highlight package for highlighting

## 1.9.2

-   Don't depend on marker internals

## 1.9.1

-   Make vertical padding smaller on ide-haskell-item-description
-   Add README info on changing panel style

## 1.9.0

-   Panel tooltips
-   Fix state-saved tab activation
-   Auto hide output option (thanks @supermario, \#185)
-   Vertical panel heading when docked left/right, style cleanup

## 1.8.3

-   s/target/currentTarget
-   Bring highlighter in-line with other projects
-   Atom 1.13 update
-   Update CHANGELOG
-   Fix LICENSE date
-   Update LICENSE

## 1.8.2

-   Prepare 1.8.2 release
-   Don't emit should-show-tooltip if range under cursor is unchanged
-   Use Atom's highlights code for tooltips, etc

## 1.8.1

-   Add custom prettifier options

## 1.8.0

-   UPI 0.2: get/setConfigParam only promises

## 1.7.2

-   Throw error if package isn't active
-   Add aspv to deps

## 1.7.1

-   Possibly undefined argument

## 1.7.0

-   UPI 0.1.0: keep per-project plugin configuration
-   Cleanup result-item destruction
-   Requires cleanup
-   Remove unneeded require

## 1.6.7

-   Destroy check-result markers on invalidation

## 1.6.6

-   Quick-patch tootlips to work on atom-1.9.0-beta2
-   Readme update

## 1.6.5

-   Use typeof instead instanceof where possible

## 1.6.4

-   AHS bump
-   AHS bump

## 1.6.3

-   Handle non-zero exit code in prettify

## 1.6.2

-   Use general algo to get root dir for prettify

## 1.6.1

-   Shut up deprecation cop
-   \[README\] Installing with cabal
-   Fix changelog

## 1.6.0

-   Fix MessageObject toHtml tokenization
-   Move build target select list style to ide-haskell-cabal
-   Move ide-haskell-target style to ide-haskell-cabal
-   Cleaner tooltip arrow

## 1.5.4

-   Fix html entities in messages

## 1.5.3

-   Clean panel font styles

## 1.5.2

-   Bind check result markers to editor id
-   Update UPI docs

## 1.5.1

-   onShouldShowTooltip callback can return undef/val

## 1.5.0

-   Update CHANGELOG
-   Show tooltip on selection range
-   Do away with ::shadow selector
-   Typo (pull request \#144 from @ggreif)

## 1.4.2

-   Vertical spacing for multi-message tooltips
-   Support array TooltipMessage

## 1.4.1

-   Fix some bugs in MessageObject

## 1.4.0

-   Add more detail to setup instructions (pull request \#140 from
    1)

-   Pretty tooltips

## 1.3.9

-   Add ide-haskell class to atom-workspace
-   Grammar
-   Update TODO

## 1.3.8

-   Fix getEventType for Atom 1.3.x
-   update contributors

## 1.3.7

-   Might be no controller on close-tooltip

## 1.3.6

-   Fix tooltip fail reporting

## 1.3.5

-   Cleanup & Fix deprecation warnings

## 1.3.4

-   Disable progress bar animation while invisible

## 1.3.3

-   Even more robust tooltip hiding (amend 1.3.2)

## 1.3.2

-   More robust tooltip hiding

## 1.3.1

-   Drop linter styles

## 1.3.0

-   Panel resizing for different positions
-   Use simpler view API
-   Initial support for setting output panel position

## 1.2.0

-   Show cursor position on cursor move (\#120)

## 1.1.0

-   Handle controller-specific event disposal in controller dtor
-   EditorController.onDidStopChanging

## 1.0.0

-   UPI interface

## 0.8.0

-   Build backend support
-   Output panel revamped
-   Add 'show info fallback to type' command/mouseover option
-   Support for arbitrary message types
-   Config cleaned up
-   General code cleanup
-   Proper disposal in views, using SubAtom for event listeners
-   Filter based on current file
-   State save
-   Moved command registration to backend consumption
-   Moved menu initialization to after backend consumption
-   Renamed 'Linter' menu option to 'Lint'
-   Activation logic revamped
-   Removed autocomplete-haskell startup message

## 0.7.2

-   Run `stylish-haskell` and `cabal format` in file directory to allow
    for more fine-grained control with `.stylish-haskell.yaml`

## 0.7.1

-   Fix auto-switch to tab

## 0.7.0

-   Go-to-next/prev error

## 0.6.2

-   Pass-through `escape` keybinding for close-tooltip if there are no
    tooltips

## 0.6.1

-   Make ide-backend commands optional (i.e.??check if those exist before
    calling)

## 0.6.0

-   Optional support for AtomLinter for showing project messages,
    support for haskell-ghc-mod 0.8.0

## 0.5.14

-   Initial support for literate Haskell

## 0.5.13

-   Fixes for Atom 0.209 API change w.r.t. mouse position
-   Better error tooltips

## 0.5.12

-   Fix \#73

## 0.5.11

-   Fix \#67 (trying to get row length beyond last row)
-   Initial implementation of insert-import

## 0.5.10

-   Don't try to restore cursor positions on prettify if no cursor

## 0.5.9

-   Run check and lint in onDidSave
-   Limit max panel height to 50% viewport

## 0.5.8

-   Fix an error when editor is closed while waiting for an operation to
    complete.

## 0.5.7

-   Run context menu commands on last mouse position
-   Version bump to haskell-ide-backend
-   Version bump to backend-helper
-   Deactivation cleanup
-   Insert import stubs
-   CSS hack to catch mouse events only on .scroll-view (specialized to
    atom-text-editor\[data-grammar\~="haskell"\])
-   Don't queue more than one type/info request (\#63)
-   Check if mouse is still in expression range before showing tooltip
    (\#63)
-   Cabal format (\#24)

## 0.5.6

-   Tooltip behavior updates (\#62):
    -   Don't hide tooltip unless new is ready, or none is expected
    -   Show tooltip at the start of expression, and not at mouse
        position (only when invoked by mouse)
    -   Set pointer-events:none on atom-overlay
    -   Disable fade-in to reduce flicker

## 0.5.5

-   Show warning state in outputView on fail to get info/type
-   Bump to haskell-ide-backend-0.1.1

## 0.5.4

-   Preserve cursor position on prettify (\#58)

## 0.5.3

-   Make closeTooltipsOnCursorMove matter
-   More accurate fix for error on close (\#56)

## 0.5.2

-   Fix error on file close (\#56)

## 0.5.1

-   Fix error when hovering mouse over selection

## 0.5.0

-   Specify Atom version according to docs
-   Migration to haskell-ide-backend service
-   Autocompletion delegated to autocomplete-haskell
-   Stop backend menu option
-   Hotkeys configurable from settings window
-   Most commands are bound to haskell grammar editors
-   Option to prettify file on save (some problems exist)
-   Command to insert type
-   Now works on standalone Haskell files!

## 0.4.2

-   Allowing text selection in bottom pane (Daniel Beskin)
-   Fixing a missing resize cursor on Windows (Daniel Beskin)

## 0.4.1

-   Somewhat better error-reporting on ghc-mod errors
-   Options descriptions

## 0.4.0

-   Fixed main file deprecations
-   Fixed \#50

## 0.3.6

-   Fixed \#48

## 0.3.5

-   Fixed ghc-mod newline compatibility on Windows (Luka Horvat)

## 0.3.4

-   Fixed \#44

## 0.3.3

-   Fixed \#26, \#37, \#40
-   Added a hack, which should hopefully fix \#29

## 0.3.2

-   Fixed \#16
-   Fixed \#25

## 0.3.1

-   Fixed: Upgrade to atom 1.0 api. Upgrade autocomplete (John Quigley)
-   Fixed: Fix issue requiring package to be manually
    deactivated/reactivated (John Quigley)

## 0.3.0

-   New: Code prettify by `stylish-haskell`.

## 0.2.0

-   New: Autocompletion feature added (issue \#4).
-   Fixed: Types and errors tooltips were not showed if `Soft Wrap` was
    turned on.

## 0.1.2

-   Fixed: \#3, \#8, \#9, \#10, \#11, \#13.
-   Fixed: After multiple package enable-disable actions multiple
    `ghc-mod` utilities started in concurrent with the same task.

## 0.1.1

-   Fixed: Package disable and uninstall works now.

## 0.1.0

-   First release.
