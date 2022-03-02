"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoogleDocView = void 0;
const atom_1 = require("atom");
const etch = require("etch");
const util_1 = require("./util");
class HoogleDocView {
    constructor(props = {}) {
        this.props = props;
        this.disposables = new atom_1.CompositeDisposable();
        this.style = {};
        this.parsedDoc = '';
        this.openWebDoc = () => {
            this.props.symbol && util_1.openWeb(this.props.symbol, false);
        };
        this.updateDoc(props.symbol && props.symbol.doc);
        this.disposables.add(atom.config.observe('editor.fontSize', (fontSize) => {
            if (fontSize) {
                this.style.fontSize = `${fontSize}px`;
            }
        }), atom.config.observe('editor.fontFamily', (fontFamily) => {
            if (fontFamily) {
                this.style.fontFamily = fontFamily;
            }
        }));
        etch.initialize(this);
    }
    render() {
        const hrefBtns = [];
        if (this.props.symbol && this.props.symbol.href) {
            hrefBtns.push(etch.dom("a", { class: "btn btn-default", on: { click: this.openWebDoc } }, "Open web documentation"), etch.dom("a", { class: "btn btn-default", href: this.props.symbol.href }, "Open web documentation in browser"));
        }
        return (etch.dom("div", { class: "ide-haskell-hoogle" },
            etch.dom("div", { style: this.style, className: "ide-haskell-hoogle-doc-header", innerHTML: util_1.hl((this.props.symbol && this.props.symbol.signature) || '') }),
            etch.dom("div", { className: "btn-group" }, hrefBtns),
            etch.dom("div", { class: "ide-haskell-hoogle-output editor editor-colors native-key-bindings", style: this.style, tabIndex: "-1", innerHTML: this.parsedDoc })));
    }
    async update(props) {
        if ((this.props.symbol && this.props.symbol.doc) !==
            (props.symbol && props.symbol.doc)) {
            this.updateDoc(props.symbol && props.symbol.doc);
        }
        this.props = props;
        return etch.update(this);
    }
    getURI() {
        return 'ide-haskell://hoogle/doc/';
    }
    getTitle() {
        return 'Hoogle doc';
    }
    destroy() {
        etch.destroy(this);
        this.disposables.dispose();
    }
    serialize() {
        return Object.assign(Object.assign({}, this.props), { deserializer: 'HoogleDocView' });
    }
    updateDoc(doc) {
        if (!doc) {
            this.parsedDoc = 'No documentation';
            return;
        }
        const div = document.createElement('div');
        div.innerHTML = doc;
        div.querySelectorAll('pre').forEach((el) => {
            el.innerHTML = util_1.hl(el.innerText);
        });
        div.querySelectorAll('a').forEach((el) => {
            el.outerHTML = util_1.hl(el.innerText.trim());
        });
        this.parsedDoc = div.innerHTML;
    }
}
exports.HoogleDocView = HoogleDocView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9vZ2xlLWRvYy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2hvb2dsZS1kb2Mtdmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0JBQTBDO0FBQzFDLDZCQUE0QjtBQUM1QixpQ0FBb0M7QUFRcEMsTUFBYSxhQUFhO0lBT3hCLFlBQW1CLFFBQWdCLEVBQUU7UUFBbEIsVUFBSyxHQUFMLEtBQUssQ0FBYTtRQU45QixnQkFBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtRQUN0QyxVQUFLLEdBR1QsRUFBRSxDQUFBO1FBQ0UsY0FBUyxHQUFXLEVBQUUsQ0FBQTtRQW1HdEIsZUFBVSxHQUFHLEdBQUcsRUFBRTtZQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxjQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDeEQsQ0FBQyxDQUFBO1FBbkdDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFFBQWdCLEVBQUUsRUFBRTtZQUMxRCxJQUFJLFFBQVEsRUFBRTtnQkFDWixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLFFBQVEsSUFBSSxDQUFBO2FBQ3RDO1FBQ0gsQ0FBQyxDQUFDLEVBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUU7WUFDOUQsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO2FBQ25DO1FBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FBQTtRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkIsQ0FBQztJQUVNLE1BQU07UUFDWCxNQUFNLFFBQVEsR0FBa0IsRUFBRSxDQUFBO1FBQ2xDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQy9DLFFBQVEsQ0FBQyxJQUFJLENBQ1gsZ0JBQUcsS0FBSyxFQUFDLGlCQUFpQixFQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLDZCQUVyRCxFQUVKLGdCQUFHLEtBQUssRUFBQyxpQkFBaUIsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSx3Q0FFbkQsQ0FDTCxDQUFBO1NBQ0Y7UUFDRCxPQUFPLENBQ0wsa0JBQUssS0FBSyxFQUFDLG9CQUFvQjtZQUM3QixrQkFDRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFDakIsU0FBUyxFQUFDLCtCQUErQixFQUN6QyxTQUFTLEVBQUUsU0FBRSxDQUNYLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUN6RCxHQUNEO1lBQ0Ysa0JBQUssU0FBUyxFQUFDLFdBQVcsSUFBRSxRQUFRLENBQU87WUFDM0Msa0JBQ0UsS0FBSyxFQUFDLG9FQUFvRSxFQUMxRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFDakIsUUFBUSxFQUFDLElBQUksRUFDYixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FDekIsQ0FDRSxDQUNQLENBQUE7SUFDSCxDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFhO1FBQy9CLElBQ0UsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7WUFDNUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQ2xDO1lBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDakQ7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtRQUNsQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDMUIsQ0FBQztJQUVNLE1BQU07UUFDWCxPQUFPLDJCQUEyQixDQUFBO0lBQ3BDLENBQUM7SUFFTSxRQUFRO1FBQ2IsT0FBTyxZQUFZLENBQUE7SUFDckIsQ0FBQztJQUVNLE9BQU87UUFFWixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUIsQ0FBQztJQUVNLFNBQVM7UUFDZCx1Q0FDSyxJQUFJLENBQUMsS0FBSyxLQUNiLFlBQVksRUFBRSxlQUFlLElBQzlCO0lBQ0gsQ0FBQztJQUVPLFNBQVMsQ0FBQyxHQUF1QjtRQUN2QyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1IsSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQTtZQUNuQyxPQUFNO1NBQ1A7UUFDRCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3pDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUN6QyxFQUFFLENBQUMsU0FBUyxHQUFHLFNBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDakMsQ0FBQyxDQUFDLENBQUE7UUFDRixHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDdkMsRUFBRSxDQUFDLFNBQVMsR0FBRyxTQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ3hDLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFBO0lBQ2hDLENBQUM7Q0FLRjtBQTVHRCxzQ0E0R0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIGV0Y2ggZnJvbSAnZXRjaCdcbmltcG9ydCB7IGhsLCBvcGVuV2ViIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIEpTWC5Qcm9wcyB7XG4gIHN5bWJvbD86IElTeW1ib2xcbn1cblxudHlwZSBFbGVtZW50Q2xhc3MgPSBKU1guRWxlbWVudENsYXNzXG5cbmV4cG9ydCBjbGFzcyBIb29nbGVEb2NWaWV3IGltcGxlbWVudHMgRWxlbWVudENsYXNzIHtcbiAgcHVibGljIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBwcml2YXRlIHN0eWxlOiB7XG4gICAgZm9udFNpemU/OiBzdHJpbmdcbiAgICBmb250RmFtaWx5Pzogc3RyaW5nXG4gIH0gPSB7fVxuICBwcml2YXRlIHBhcnNlZERvYzogc3RyaW5nID0gJydcbiAgY29uc3RydWN0b3IocHVibGljIHByb3BzOiBJUHJvcHMgPSB7fSkge1xuICAgIHRoaXMudXBkYXRlRG9jKHByb3BzLnN5bWJvbCAmJiBwcm9wcy5zeW1ib2wuZG9jKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmZvbnRTaXplJywgKGZvbnRTaXplOiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGZvbnRTaXplKSB7XG4gICAgICAgICAgdGhpcy5zdHlsZS5mb250U2l6ZSA9IGAke2ZvbnRTaXplfXB4YFxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5mb250RmFtaWx5JywgKGZvbnRGYW1pbHk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoZm9udEZhbWlseSkge1xuICAgICAgICAgIHRoaXMuc3R5bGUuZm9udEZhbWlseSA9IGZvbnRGYW1pbHlcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKVxuICAgIGV0Y2guaW5pdGlhbGl6ZSh0aGlzKVxuICB9XG5cbiAgcHVibGljIHJlbmRlcigpIHtcbiAgICBjb25zdCBocmVmQnRuczogSlNYLkVsZW1lbnRbXSA9IFtdXG4gICAgaWYgKHRoaXMucHJvcHMuc3ltYm9sICYmIHRoaXMucHJvcHMuc3ltYm9sLmhyZWYpIHtcbiAgICAgIGhyZWZCdG5zLnB1c2goXG4gICAgICAgIDxhIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgb249e3sgY2xpY2s6IHRoaXMub3BlbldlYkRvYyB9fT5cbiAgICAgICAgICBPcGVuIHdlYiBkb2N1bWVudGF0aW9uXG4gICAgICAgIDwvYT4sXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZToganN4LXdyYXAtbXVsdGlsaW5lXG4gICAgICAgIDxhIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgaHJlZj17dGhpcy5wcm9wcy5zeW1ib2wuaHJlZn0+XG4gICAgICAgICAgT3BlbiB3ZWIgZG9jdW1lbnRhdGlvbiBpbiBicm93c2VyXG4gICAgICAgIDwvYT4sXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzPVwiaWRlLWhhc2tlbGwtaG9vZ2xlXCI+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBzdHlsZT17dGhpcy5zdHlsZX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJpZGUtaGFza2VsbC1ob29nbGUtZG9jLWhlYWRlclwiXG4gICAgICAgICAgaW5uZXJIVE1MPXtobChcbiAgICAgICAgICAgICh0aGlzLnByb3BzLnN5bWJvbCAmJiB0aGlzLnByb3BzLnN5bWJvbC5zaWduYXR1cmUpIHx8ICcnLFxuICAgICAgICAgICl9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+e2hyZWZCdG5zfTwvZGl2PlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3M9XCJpZGUtaGFza2VsbC1ob29nbGUtb3V0cHV0IGVkaXRvciBlZGl0b3ItY29sb3JzIG5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICAgIHN0eWxlPXt0aGlzLnN0eWxlfVxuICAgICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICAgIGlubmVySFRNTD17dGhpcy5wYXJzZWREb2N9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgdXBkYXRlKHByb3BzOiBJUHJvcHMpIHtcbiAgICBpZiAoXG4gICAgICAodGhpcy5wcm9wcy5zeW1ib2wgJiYgdGhpcy5wcm9wcy5zeW1ib2wuZG9jKSAhPT1cbiAgICAgIChwcm9wcy5zeW1ib2wgJiYgcHJvcHMuc3ltYm9sLmRvYylcbiAgICApIHtcbiAgICAgIHRoaXMudXBkYXRlRG9jKHByb3BzLnN5bWJvbCAmJiBwcm9wcy5zeW1ib2wuZG9jKVxuICAgIH1cbiAgICB0aGlzLnByb3BzID0gcHJvcHNcbiAgICByZXR1cm4gZXRjaC51cGRhdGUodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBnZXRVUkkoKSB7XG4gICAgcmV0dXJuICdpZGUtaGFza2VsbDovL2hvb2dsZS9kb2MvJ1xuICB9XG5cbiAgcHVibGljIGdldFRpdGxlKCkge1xuICAgIHJldHVybiAnSG9vZ2xlIGRvYydcbiAgfVxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgIGV0Y2guZGVzdHJveSh0aGlzKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IElQcm9wcyAmIHsgZGVzZXJpYWxpemVyOiBzdHJpbmcgfSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnRoaXMucHJvcHMsXG4gICAgICBkZXNlcmlhbGl6ZXI6ICdIb29nbGVEb2NWaWV3JyxcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZURvYyhkb2M6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgIGlmICghZG9jKSB7XG4gICAgICB0aGlzLnBhcnNlZERvYyA9ICdObyBkb2N1bWVudGF0aW9uJ1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZGl2LmlubmVySFRNTCA9IGRvY1xuICAgIGRpdi5xdWVyeVNlbGVjdG9yQWxsKCdwcmUnKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgZWwuaW5uZXJIVE1MID0gaGwoZWwuaW5uZXJUZXh0KVxuICAgIH0pXG4gICAgZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgZWwub3V0ZXJIVE1MID0gaGwoZWwuaW5uZXJUZXh0LnRyaW0oKSlcbiAgICB9KVxuICAgIHRoaXMucGFyc2VkRG9jID0gZGl2LmlubmVySFRNTFxuICB9XG5cbiAgcHJpdmF0ZSBvcGVuV2ViRG9jID0gKCkgPT4ge1xuICAgIHRoaXMucHJvcHMuc3ltYm9sICYmIG9wZW5XZWIodGhpcy5wcm9wcy5zeW1ib2wsIGZhbHNlKVxuICB9XG59XG4iXX0=