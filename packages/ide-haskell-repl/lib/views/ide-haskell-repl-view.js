"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const highlightSync = require("atom-highlight");
const etch = require("etch");
const ide_haskell_repl_base_1 = require("../ide-haskell-repl-base");
const button_1 = require("./button");
const editor_1 = require("./editor");
const util_1 = require("../util");
const termEscapeRx = /\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g;
class IdeHaskellReplView extends ide_haskell_repl_base_1.IdeHaskellReplBase {
    constructor(props) {
        super(props.upiPromise, props.state, `view:${props.state.uri}`);
        this.props = props;
        this.initialized = false;
        this.focus = () => {
            this.refs && this.refs.editor && this.refs.editor.element.focus();
        };
        this.disposables = new atom_1.CompositeDisposable();
        this.editor = atom.workspace.buildTextEditor({
            lineNumberGutterVisible: false,
            softWrapped: true,
        });
        atom.grammars.assignLanguageMode(this.editor.getBuffer(), 'source.haskell');
        this.fontSettings = {
            outputFontSize: atom.config.get('editor.fontSize'),
            outputFontFamily: atom.config.get('editor.fontFamily'),
        };
        this.disposables.add(atom.workspace.observeTextEditors((editor) => {
            if (editor.getPath() === this.uri) {
                this.disposables.add(editor.onDidSave(() => {
                    if (this.autoReloadRepeat) {
                        this.ghciReloadRepeat();
                    }
                }));
            }
        }), atom.config.onDidChange('editor.fontSize', ({ newValue }) => {
            util_1.handlePromise(this.update({ outputFontSize: newValue }));
        }), atom.config.onDidChange('editor.fontFamily', ({ newValue }) => {
            util_1.handlePromise(this.update({ outputFontFamily: newValue }));
        }));
        etch.initialize(this);
        if (this.props.state.focus)
            setImmediate(() => this.focus());
        this.registerEditor().catch((e) => {
            atom.notifications.addError(e.toString(), {
                detail: e.stack,
                dismissable: true,
            });
        });
    }
    async execCommand() {
        if (!this.initialized)
            return undefined;
        const inp = this.editor.getBuffer().getText();
        this.editor.setText('');
        if (this.ghci && this.ghci.isBusy()) {
            this.messages.push({
                text: inp,
                hl: false,
                cls: 'ide-haskell-repl-input-stdin',
            });
            this.ghci.writeRaw(inp);
            await this.update();
            return undefined;
        }
        else {
            this.history.save(inp);
            return this.runCommand(inp);
        }
    }
    copyText(command) {
        this.editor.setText(command);
        atom.views.getView(this.editor).focus();
    }
    historyBack() {
        const current = this.editor.getText();
        this.editor.setText(this.history.goBack(current));
    }
    historyForward() {
        this.editor.setText(this.history.goForward());
    }
    clear() {
        this.messages = [];
        this.clearErrors();
        this.update();
    }
    getURI() {
        return `ide-haskell://repl/${this.uri}`;
    }
    getTitle() {
        return `REPL: ${this.uri}`;
    }
    async destroy() {
        if (this.destroyed)
            return;
        await etch.destroy(this);
        this.disposables.dispose();
        return super.destroy();
    }
    serialize() {
        return {
            deserializer: 'IdeHaskellReplView',
            uri: this.uri,
            content: this.messages,
            history: this.history.serialize(),
            autoReloadRepeat: this.autoReloadRepeat,
            focus: this.isFocused(),
        };
    }
    async update(props) {
        if (props)
            Object.assign(this.fontSettings, props);
        const atEnd = !!this.refs &&
            this.refs.output.scrollTop + this.refs.output.clientHeight >=
                this.refs.output.scrollHeight - this.fontSettings.outputFontSize;
        const focused = this.isFocused();
        await etch.update(this);
        if (atEnd) {
            this.refs.output.scrollTop =
                this.refs.output.scrollHeight - this.refs.output.clientHeight;
        }
        if (focused) {
            this.focus();
        }
    }
    render() {
        return (etch.dom("div", { className: "ide-haskell-repl", tabIndex: "-1", on: { focus: this.focus } },
            etch.dom("div", { ref: "output", key: "output", className: "ide-haskell-repl-output native-key-bindings", tabIndex: "-1", style: {
                    fontSize: `${this.fontSettings.outputFontSize}px`,
                    fontFamily: this.fontSettings.outputFontFamily,
                } }, this.renderOutput()),
            this.renderErrDiv(),
            etch.dom("div", { key: "buttons", className: "button-container" },
                this.renderPrompt(),
                etch.dom(button_1.Button, { cls: "reload-repeat", tooltip: "Reload file and repeat last command", command: "ide-haskell-repl:reload-repeat", parent: this }),
                etch.dom(button_1.Button, { cls: "auto-reload-repeat", tooltip: "Toggle reload-repeat on file save", command: "ide-haskell-repl:toggle-auto-reload-repeat", state: this.autoReloadRepeat, parent: this }),
                etch.dom(button_1.Button, { cls: "interrupt", tooltip: "Interrupt current computation", command: "ide-haskell-repl:ghci-interrupt", parent: this }),
                etch.dom(button_1.Button, { cls: "clear", tooltip: "Clear output", command: "ide-haskell-repl:clear-output", parent: this })),
            etch.dom("div", { key: "editor", className: "ide-haskell-repl-editor" },
                etch.dom("div", { className: "editor-container" },
                    etch.dom(editor_1.Editor, { ref: "editor", element: atom.views.getView(this.editor) })),
                etch.dom(button_1.Button, { cls: "exec", tooltip: "Run code", command: "ide-haskell-repl:exec-command", parent: this }))));
    }
    async onInitialLoad() {
        if (!this.ghci) {
            throw new Error('No GHCI instance!');
        }
        await super.onInitialLoad();
        const res = await this.ghci.load(this.uri);
        this.prompt = res.prompt[1];
        this.errorsFromStderr(res.stderr);
        this.initialized = true;
    }
    renderErrDiv() {
        if (!this.upi) {
            return (etch.dom("div", { className: "native-key-bindings ide-haskell-repl-error", tabIndex: "-1" }, this.renderErrors()));
        }
        else {
            return null;
        }
    }
    renderErrors() {
        return this.errors.map((err) => this.renderError(err));
    }
    renderError(error) {
        const pos = error.position ? atom_1.Point.fromObject(error.position) : undefined;
        const uri = error.uri || '<interactive>';
        const positionText = pos ? `${uri}: ${pos.row + 1}, ${pos.column + 1}` : uri;
        const context = error.context || '';
        return (etch.dom("div", null,
            positionText,
            ":",
            ' ',
            etch.dom("span", { className: `ide-haskell-repl-error-${error.severity}` }, error.severity),
            ": ",
            context,
            etch.dom("div", { class: "ide-haskell-repl-error-message" }, error.message)));
    }
    renderPrompt() {
        const busyClass = this.ghci && this.ghci.isBusy() ? ' ide-haskell-repl-busy' : '';
        return (etch.dom("div", { class: `repl-prompt${busyClass}` },
            this.prompt || '',
            ">"));
    }
    renderOutput() {
        const maxMsg = atom.config.get('ide-haskell-repl.maxMessages');
        if (maxMsg > 0) {
            this.messages = this.messages.slice(-maxMsg);
        }
        return this.messages.map((msg) => {
            const { text, cls, hl } = msg;
            let { hlcache } = msg;
            const cleanText = text.replace(termEscapeRx, '');
            if (hl) {
                if (!hlcache) {
                    hlcache = msg.hlcache = highlightSync({
                        fileContents: cleanText,
                        scopeName: 'source.haskell',
                        nbsp: false,
                    });
                }
                return (etch.dom("pre", { className: cls, innerHTML: hlcache }));
            }
            else {
                return etch.dom("pre", { className: cls }, cleanText);
            }
        });
    }
    isFocused() {
        return (!!this.refs &&
            !!document.activeElement &&
            this.refs.editor.element.contains(document.activeElement));
    }
    async registerEditor() {
        const we = await this.props.watchEditorPromise;
        if (this.destroyed)
            return;
        this.disposables.add(we(this.editor, ['ide-haskell-repl']));
    }
}
exports.IdeHaskellReplView = IdeHaskellReplView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlLWhhc2tlbGwtcmVwbC12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZpZXdzL2lkZS1oYXNrZWxsLXJlcGwtdmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBMkU7QUFDM0UsZ0RBQWdEO0FBQ2hELDZCQUE2QjtBQUU3QixvRUFNaUM7QUFDakMscUNBQWlDO0FBQ2pDLHFDQUFpQztBQUVqQyxrQ0FBdUM7QUFJdkMsTUFBTSxZQUFZLEdBQUcseUNBQXlDLENBQUE7QUFrQjlELE1BQWEsa0JBQW1CLFNBQVEsMENBQWtCO0lBVXhELFlBQW1CLEtBQWE7UUFDOUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUQ5QyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBRHhCLGdCQUFXLEdBQVksS0FBSyxDQUFBO1FBK0M3QixVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ25FLENBQUMsQ0FBQTtRQTlDQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtRQUU1QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO1lBQzNDLHVCQUF1QixFQUFFLEtBQUs7WUFDOUIsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUE7UUFFM0UsSUFBSSxDQUFDLFlBQVksR0FB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QzFELENBQUE7SUFDSCxDQUFDO0lBRU8sS0FBSyxDQUFDLGNBQWM7UUFDMUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFBO1FBQzlDLElBQUksSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFNO1FBQzFCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDN0QsQ0FBQztDQUNGO0FBdFRELGdEQXNUQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRFZGl0b3IsIFBvaW50LCBUV2F0Y2hFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IGhpZ2hsaWdodFN5bmMgPSByZXF1aXJlKCdhdG9tLWhpZ2hsaWdodCcpXG5pbXBvcnQgZXRjaCA9IHJlcXVpcmUoJ2V0Y2gnKVxuXG5pbXBvcnQge1xuICBJQ29udGVudEl0ZW0sXG4gIElkZUhhc2tlbGxSZXBsQmFzZSxcbiAgSVZpZXdTdGF0ZSxcbiAgSUVycm9ySXRlbSxcbiAgSVJlcXVlc3RSZXN1bHQsXG59IGZyb20gJy4uL2lkZS1oYXNrZWxsLXJlcGwtYmFzZSdcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vYnV0dG9uJ1xuaW1wb3J0IHsgRWRpdG9yIH0gZnJvbSAnLi9lZGl0b3InXG5pbXBvcnQgeyBVUElDb25zdW1lciB9IGZyb20gJy4uL3VwaUNvbnN1bWVyJ1xuaW1wb3J0IHsgaGFuZGxlUHJvbWlzZSB9IGZyb20gJy4uL3V0aWwnXG5cbmV4cG9ydCB7IElWaWV3U3RhdGUsIElDb250ZW50SXRlbSwgSVJlcXVlc3RSZXN1bHQgfVxuXG5jb25zdCB0ZXJtRXNjYXBlUnggPSAvXFx4MUJcXFsoWzAtOV17MSwyfSg7WzAtOV17MSwyfSk/KT9bbXxLXS9nXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZpZXdTdGF0ZU91dHB1dCBleHRlbmRzIElWaWV3U3RhdGUge1xuICBkZXNlcmlhbGl6ZXI6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIEpTWC5Qcm9wcyB7XG4gIHVwaVByb21pc2U6IFByb21pc2U8VVBJQ29uc3VtZXIgfCB1bmRlZmluZWQ+XG4gIHN0YXRlOiBJVmlld1N0YXRlXG4gIHdhdGNoRWRpdG9yUHJvbWlzZTogUHJvbWlzZTxUV2F0Y2hFZGl0b3I+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlUHJvcHMgZXh0ZW5kcyBKU1guUHJvcHMge1xuICBvdXRwdXRGb250RmFtaWx5OiBzdHJpbmdcbiAgb3V0cHV0Rm9udFNpemU6IG51bWJlclxufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5zYWZlLWFueVxuZXhwb3J0IGNsYXNzIElkZUhhc2tlbGxSZXBsVmlldyBleHRlbmRzIElkZUhhc2tlbGxSZXBsQmFzZVxuICBpbXBsZW1lbnRzIEpTWC5FbGVtZW50Q2xhc3Mge1xuICBwdWJsaWMgcmVmcyE6IHtcbiAgICBvdXRwdXQ6IEhUTUxFbGVtZW50XG4gICAgZWRpdG9yOiBFZGl0b3JcbiAgfVxuICBwdWJsaWMgZWRpdG9yOiBUZXh0RWRpdG9yXG4gIHByaXZhdGUgZm9udFNldHRpbmdzOiBVcGRhdGVQcm9wc1xuICBwcml2YXRlIGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIHByaXZhdGUgaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvcHM6IElQcm9wcykge1xuICAgIHN1cGVyKHByb3BzLnVwaVByb21pc2UsIHByb3BzLnN0YXRlLCBgdmlldzoke3Byb3BzLnN0YXRlLnVyaX1gKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLmVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7XG4gICAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZTogZmFsc2UsXG4gICAgICBzb2Z0V3JhcHBlZDogdHJ1ZSxcbiAgICB9KVxuICAgIGF0b20uZ3JhbW1hcnMuYXNzaWduTGFuZ3VhZ2VNb2RlKHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLCAnc291cmNlLmhhc2tlbGwnKVxuXG4gICAgdGhpcy5mb250U2V0dGluZ3MgPSB7XG4gICAgICBvdXRwdXRGb250U2l6ZTogYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKSxcbiAgICAgIG91dHB1dEZvbnRGYW1pbHk6IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKSxcbiAgICB9XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcjogVGV4dEVkaXRvcikgPT4ge1xuICAgICAgICBpZiAoZWRpdG9yLmdldFBhdGgoKSA9PT0gdGhpcy51cmkpIHtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgICAgIGVkaXRvci5vbkRpZFNhdmUoKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAodGhpcy5hdXRvUmVsb2FkUmVwZWF0KSB7XG4gICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgICAgICAgICAgICAgdGhpcy5naGNpUmVsb2FkUmVwZWF0KClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdlZGl0b3IuZm9udFNpemUnLCAoeyBuZXdWYWx1ZSB9KSA9PiB7XG4gICAgICAgIGhhbmRsZVByb21pc2UodGhpcy51cGRhdGUoeyBvdXRwdXRGb250U2l6ZTogbmV3VmFsdWUgfSkpXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdlZGl0b3IuZm9udEZhbWlseScsICh7IG5ld1ZhbHVlIH0pID0+IHtcbiAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnVwZGF0ZSh7IG91dHB1dEZvbnRGYW1pbHk6IG5ld1ZhbHVlIH0pKVxuICAgICAgfSksXG4gICAgKVxuXG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpXG5cbiAgICBpZiAodGhpcy5wcm9wcy5zdGF0ZS5mb2N1cykgc2V0SW1tZWRpYXRlKCgpID0+IHRoaXMuZm9jdXMoKSlcbiAgICB0aGlzLnJlZ2lzdGVyRWRpdG9yKCkuY2F0Y2goKGU6IEVycm9yKSA9PiB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZS50b1N0cmluZygpLCB7XG4gICAgICAgIGRldGFpbDogZS5zdGFjayxcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgZm9jdXMgPSAoKSA9PiB7XG4gICAgdGhpcy5yZWZzICYmIHRoaXMucmVmcy5lZGl0b3IgJiYgdGhpcy5yZWZzLmVkaXRvci5lbGVtZW50LmZvY3VzKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjQ29tbWFuZCgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBpbnAgPSB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5nZXRUZXh0KClcbiAgICB0aGlzLmVkaXRvci5zZXRUZXh0KCcnKVxuICAgIGlmICh0aGlzLmdoY2kgJiYgdGhpcy5naGNpLmlzQnVzeSgpKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICB0ZXh0OiBpbnAsXG4gICAgICAgIGhsOiBmYWxzZSxcbiAgICAgICAgY2xzOiAnaWRlLWhhc2tlbGwtcmVwbC1pbnB1dC1zdGRpbicsXG4gICAgICB9KVxuICAgICAgdGhpcy5naGNpLndyaXRlUmF3KGlucClcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlKClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaXN0b3J5LnNhdmUoaW5wKVxuICAgICAgcmV0dXJuIHRoaXMucnVuQ29tbWFuZChpbnApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNvcHlUZXh0KGNvbW1hbmQ6IHN0cmluZykge1xuICAgIHRoaXMuZWRpdG9yLnNldFRleHQoY29tbWFuZClcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpLmZvY3VzKClcbiAgfVxuXG4gIHB1YmxpYyBoaXN0b3J5QmFjaygpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dCgpXG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dCh0aGlzLmhpc3RvcnkuZ29CYWNrKGN1cnJlbnQpKVxuICB9XG5cbiAgcHVibGljIGhpc3RvcnlGb3J3YXJkKCkge1xuICAgIHRoaXMuZWRpdG9yLnNldFRleHQodGhpcy5oaXN0b3J5LmdvRm9yd2FyZCgpKVxuICB9XG5cbiAgcHVibGljIGNsZWFyKCkge1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuY2xlYXJFcnJvcnMoKVxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRVUkkoKSB7XG4gICAgcmV0dXJuIGBpZGUtaGFza2VsbDovL3JlcGwvJHt0aGlzLnVyaX1gXG4gIH1cblxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuIGBSRVBMOiAke3RoaXMudXJpfWBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgYXdhaXQgZXRjaC5kZXN0cm95KHRoaXMpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICByZXR1cm4gc3VwZXIuZGVzdHJveSgpXG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IElWaWV3U3RhdGVPdXRwdXQge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdJZGVIYXNrZWxsUmVwbFZpZXcnLFxuICAgICAgdXJpOiB0aGlzLnVyaSxcbiAgICAgIGNvbnRlbnQ6IHRoaXMubWVzc2FnZXMsXG4gICAgICBoaXN0b3J5OiB0aGlzLmhpc3Rvcnkuc2VyaWFsaXplKCksXG4gICAgICBhdXRvUmVsb2FkUmVwZWF0OiB0aGlzLmF1dG9SZWxvYWRSZXBlYXQsXG4gICAgICBmb2N1czogdGhpcy5pc0ZvY3VzZWQoKSxcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgdXBkYXRlKHByb3BzPzogUGFydGlhbDxVcGRhdGVQcm9wcz4pIHtcbiAgICBpZiAocHJvcHMpIE9iamVjdC5hc3NpZ24odGhpcy5mb250U2V0dGluZ3MsIHByb3BzKVxuXG4gICAgY29uc3QgYXRFbmQgPVxuICAgICAgISF0aGlzLnJlZnMgJiZcbiAgICAgIHRoaXMucmVmcy5vdXRwdXQuc2Nyb2xsVG9wICsgdGhpcy5yZWZzLm91dHB1dC5jbGllbnRIZWlnaHQgPj1cbiAgICAgICAgdGhpcy5yZWZzLm91dHB1dC5zY3JvbGxIZWlnaHQgLSB0aGlzLmZvbnRTZXR0aW5ncy5vdXRwdXRGb250U2l6ZVxuICAgIGNvbnN0IGZvY3VzZWQgPSB0aGlzLmlzRm9jdXNlZCgpXG4gICAgYXdhaXQgZXRjaC51cGRhdGUodGhpcylcbiAgICBpZiAoYXRFbmQpIHtcbiAgICAgIHRoaXMucmVmcy5vdXRwdXQuc2Nyb2xsVG9wID1cbiAgICAgICAgdGhpcy5yZWZzLm91dHB1dC5zY3JvbGxIZWlnaHQgLSB0aGlzLnJlZnMub3V0cHV0LmNsaWVudEhlaWdodFxuICAgIH1cbiAgICBpZiAoZm9jdXNlZCkge1xuICAgICAgdGhpcy5mb2N1cygpXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLy8gdHNsaW50OmRpc2FibGU6bm8tdW5zYWZlLWFueVxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJpZGUtaGFza2VsbC1yZXBsXCJcbiAgICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICAgIG9uPXt7IGZvY3VzOiB0aGlzLmZvY3VzIH19XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9XCJvdXRwdXRcIlxuICAgICAgICAgIGtleT1cIm91dHB1dFwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaWRlLWhhc2tlbGwtcmVwbC1vdXRwdXQgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRTaXplOiBgJHt0aGlzLmZvbnRTZXR0aW5ncy5vdXRwdXRGb250U2l6ZX1weGAsXG4gICAgICAgICAgICBmb250RmFtaWx5OiB0aGlzLmZvbnRTZXR0aW5ncy5vdXRwdXRGb250RmFtaWx5LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dGhpcy5yZW5kZXJPdXRwdXQoKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHt0aGlzLnJlbmRlckVyckRpdigpfVxuICAgICAgICA8ZGl2IGtleT1cImJ1dHRvbnNcIiBjbGFzc05hbWU9XCJidXR0b24tY29udGFpbmVyXCI+XG4gICAgICAgICAge3RoaXMucmVuZGVyUHJvbXB0KCl9XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY2xzPVwicmVsb2FkLXJlcGVhdFwiXG4gICAgICAgICAgICB0b29sdGlwPVwiUmVsb2FkIGZpbGUgYW5kIHJlcGVhdCBsYXN0IGNvbW1hbmRcIlxuICAgICAgICAgICAgY29tbWFuZD1cImlkZS1oYXNrZWxsLXJlcGw6cmVsb2FkLXJlcGVhdFwiXG4gICAgICAgICAgICBwYXJlbnQ9e3RoaXN9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBjbHM9XCJhdXRvLXJlbG9hZC1yZXBlYXRcIlxuICAgICAgICAgICAgdG9vbHRpcD1cIlRvZ2dsZSByZWxvYWQtcmVwZWF0IG9uIGZpbGUgc2F2ZVwiXG4gICAgICAgICAgICBjb21tYW5kPVwiaWRlLWhhc2tlbGwtcmVwbDp0b2dnbGUtYXV0by1yZWxvYWQtcmVwZWF0XCJcbiAgICAgICAgICAgIHN0YXRlPXt0aGlzLmF1dG9SZWxvYWRSZXBlYXR9XG4gICAgICAgICAgICBwYXJlbnQ9e3RoaXN9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBjbHM9XCJpbnRlcnJ1cHRcIlxuICAgICAgICAgICAgdG9vbHRpcD1cIkludGVycnVwdCBjdXJyZW50IGNvbXB1dGF0aW9uXCJcbiAgICAgICAgICAgIGNvbW1hbmQ9XCJpZGUtaGFza2VsbC1yZXBsOmdoY2ktaW50ZXJydXB0XCJcbiAgICAgICAgICAgIHBhcmVudD17dGhpc31cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNscz1cImNsZWFyXCJcbiAgICAgICAgICAgIHRvb2x0aXA9XCJDbGVhciBvdXRwdXRcIlxuICAgICAgICAgICAgY29tbWFuZD1cImlkZS1oYXNrZWxsLXJlcGw6Y2xlYXItb3V0cHV0XCJcbiAgICAgICAgICAgIHBhcmVudD17dGhpc31cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBrZXk9XCJlZGl0b3JcIiBjbGFzc05hbWU9XCJpZGUtaGFza2VsbC1yZXBsLWVkaXRvclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZWRpdG9yLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPEVkaXRvciByZWY9XCJlZGl0b3JcIiBlbGVtZW50PXthdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNscz1cImV4ZWNcIlxuICAgICAgICAgICAgdG9vbHRpcD1cIlJ1biBjb2RlXCJcbiAgICAgICAgICAgIGNvbW1hbmQ9XCJpZGUtaGFza2VsbC1yZXBsOmV4ZWMtY29tbWFuZFwiXG4gICAgICAgICAgICBwYXJlbnQ9e3RoaXN9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIC8vIHRzbGludDplbmFibGU6bm8tdW5zYWZlLWFueVxuICAgIClcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBvbkluaXRpYWxMb2FkKCkge1xuICAgIGlmICghdGhpcy5naGNpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIEdIQ0kgaW5zdGFuY2UhJylcbiAgICB9XG4gICAgYXdhaXQgc3VwZXIub25Jbml0aWFsTG9hZCgpXG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5naGNpLmxvYWQodGhpcy51cmkpXG4gICAgdGhpcy5wcm9tcHQgPSByZXMucHJvbXB0WzFdXG4gICAgdGhpcy5lcnJvcnNGcm9tU3RkZXJyKHJlcy5zdGRlcnIpXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRXJyRGl2KCkge1xuICAgIGlmICghdGhpcy51cGkpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJuYXRpdmUta2V5LWJpbmRpbmdzIGlkZS1oYXNrZWxsLXJlcGwtZXJyb3JcIlxuICAgICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICA+XG4gICAgICAgICAge3RoaXMucmVuZGVyRXJyb3JzKCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLW51bGwta2V5d29yZFxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckVycm9ycygpIHtcbiAgICByZXR1cm4gdGhpcy5lcnJvcnMubWFwKChlcnIpID0+IHRoaXMucmVuZGVyRXJyb3IoZXJyKSlcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRXJyb3IoZXJyb3I6IElFcnJvckl0ZW0pIHtcbiAgICBjb25zdCBwb3MgPSBlcnJvci5wb3NpdGlvbiA/IFBvaW50LmZyb21PYmplY3QoZXJyb3IucG9zaXRpb24pIDogdW5kZWZpbmVkXG4gICAgY29uc3QgdXJpID0gZXJyb3IudXJpIHx8ICc8aW50ZXJhY3RpdmU+J1xuICAgIGNvbnN0IHBvc2l0aW9uVGV4dCA9IHBvcyA/IGAke3VyaX06ICR7cG9zLnJvdyArIDF9LCAke3Bvcy5jb2x1bW4gKyAxfWAgOiB1cmlcbiAgICBjb25zdCBjb250ZXh0ID0gZXJyb3IuY29udGV4dCB8fCAnJ1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7cG9zaXRpb25UZXh0fTp7JyAnfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BpZGUtaGFza2VsbC1yZXBsLWVycm9yLSR7ZXJyb3Iuc2V2ZXJpdHl9YH0+XG4gICAgICAgICAge2Vycm9yLnNldmVyaXR5fVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDoge2NvbnRleHR9XG4gICAgICAgIDxkaXYgY2xhc3M9XCJpZGUtaGFza2VsbC1yZXBsLWVycm9yLW1lc3NhZ2VcIj57ZXJyb3IubWVzc2FnZX08L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyUHJvbXB0KCkge1xuICAgIGNvbnN0IGJ1c3lDbGFzcyA9XG4gICAgICB0aGlzLmdoY2kgJiYgdGhpcy5naGNpLmlzQnVzeSgpID8gJyBpZGUtaGFza2VsbC1yZXBsLWJ1c3knIDogJydcbiAgICByZXR1cm4gKFxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuc2FmZS1hbnlcbiAgICAgIDxkaXYgY2xhc3M9e2ByZXBsLXByb21wdCR7YnVzeUNsYXNzfWB9PlxuICAgICAgICB7dGhpcy5wcm9tcHQgfHwgJyd9XG4gICAgICAgICZndDtcbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyT3V0cHV0KCkge1xuICAgIGNvbnN0IG1heE1zZyA9IGF0b20uY29uZmlnLmdldCgnaWRlLWhhc2tlbGwtcmVwbC5tYXhNZXNzYWdlcycpXG4gICAgaWYgKG1heE1zZyA+IDApIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzLnNsaWNlKC1tYXhNc2cpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzLm1hcCgobXNnOiBJQ29udGVudEl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IHsgdGV4dCwgY2xzLCBobCB9ID0gbXNnXG4gICAgICBsZXQgeyBobGNhY2hlIH0gPSBtc2dcbiAgICAgIGNvbnN0IGNsZWFuVGV4dCA9IHRleHQucmVwbGFjZSh0ZXJtRXNjYXBlUngsICcnKVxuICAgICAgaWYgKGhsKSB7XG4gICAgICAgIGlmICghaGxjYWNoZSkge1xuICAgICAgICAgIGhsY2FjaGUgPSBtc2cuaGxjYWNoZSA9IGhpZ2hsaWdodFN5bmMoe1xuICAgICAgICAgICAgZmlsZUNvbnRlbnRzOiBjbGVhblRleHQsXG4gICAgICAgICAgICBzY29wZU5hbWU6ICdzb3VyY2UuaGFza2VsbCcsXG4gICAgICAgICAgICBuYnNwOiBmYWxzZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuc2FmZS1hbnlcbiAgICAgICAgICA8cHJlIGNsYXNzTmFtZT17Y2xzfSBpbm5lckhUTUw9e2hsY2FjaGV9IC8+XG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bnNhZmUtYW55XG4gICAgICAgIHJldHVybiA8cHJlIGNsYXNzTmFtZT17Y2xzfT57Y2xlYW5UZXh0fTwvcHJlPlxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGlzRm9jdXNlZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgISF0aGlzLnJlZnMgJiZcbiAgICAgICEhZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJlxuICAgICAgdGhpcy5yZWZzLmVkaXRvci5lbGVtZW50LmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWdpc3RlckVkaXRvcigpIHtcbiAgICBjb25zdCB3ZSA9IGF3YWl0IHRoaXMucHJvcHMud2F0Y2hFZGl0b3JQcm9taXNlXG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh3ZSh0aGlzLmVkaXRvciwgWydpZGUtaGFza2VsbC1yZXBsJ10pKVxuICB9XG59XG4iXX0=