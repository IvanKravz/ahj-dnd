export default class Card {
#el;
#styles;

    constructor(element) {
        this.#el = element;
        this.#styles = window.getComputedStyle(element);
    }
    
    clear() {
        this.#el.remove()
      }
    
    set styles(text) {
        this.#el.style.cssText = text;
    }

    get styles() {
        return this.#styles;
    }
    
    get proection() {
        return(() => {
            const d = document.createElement('div');
            d.classList.add('proection');
            const { width, height } = this.styles;
            d.style.cssText = `
                width: ${width};
                height: ${height};
                margin: 10px 0;
                border: 1px solid #d4d4d3;
                background: #c6c9cb;
                border-radius: 5px;
            `
            return d
        })();
    }

    get element() {
        return this.#el;
      }
}
