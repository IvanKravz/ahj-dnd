import PageLoad from './PageLoad';
import Card from './Card';

export default class PageController {
  constructor(pageLoad, stateService) {
    this.pageLoad = pageLoad;
    this.stateService = stateService;
    this.toDo = null;
    this.inProgress = null;
    this.done = null;
    this.draggingElement = null;
    this.draggingProection = null;

    this.mouseDown = this.mouseDown.bind(this);
    this.mouseOver = this.mouseOver.bind(this);
    this.mouseOut = this.mouseOut.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this)
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.toDo = document.getElementById('todo').querySelector('.cards');
      this.inProgress = document.getElementById('in-progress').querySelector('.cards');
      this.done = document.getElementById('done').querySelector('.cards');
      this.load();
    });
    window.addEventListener('unload', () => this.save());

    this.pageLoad.elemDOM();
    this.pageLoad.drawUi();

    // При нажатии на Add another card
    this.pageLoad.addCards.forEach((elem) => {
      elem.addEventListener('click', (event) => {
        event.preventDefault();

        for (const form of this.pageLoad.forms) {
          if (form.classList.contains('active')) {
            form.classList.remove('active');
          }
        }

        const target = event.target.parentElement.querySelector('.new-card-form');
        target.classList.add('active');
        target.scrollIntoView(false);
      });
    });

    // Удаление текста при добавлении новой карты при нажатии на Add another card
    Array.from(this.pageLoad.cancelBtns).forEach((elem) => {
      elem.addEventListener('click', (event) => {
        event.preventDefault();

        for (const form of this.pageLoad.forms) {
          if (form.classList.contains('active')) {
            form.classList.remove('active');
            form.reset();
          }
        }
      });
    });

    // Добавление новой карты при нажатии на Add card
    this.pageLoad.forms.forEach((item) => item.addEventListener('submit', (event) => {
      event.preventDefault();

      const input = [...item.elements][0];
      input.focus();
      const cardsCol = item.closest('.cards-col');
      const column = cardsCol.children[1];
      PageLoad.createCard(column, input.value);
      item.reset();
      item.classList.remove('active');
    }));
  }

  // При наведении мыши на область карты
  mouseOver(event) {
    event.preventDefault();

      const card = event.target.classList.contains('card');
      if (!card) {
        return;
      }
      const cardEl = event.target;
      const delBtn = cardEl.querySelector('.delete-btn');
      delBtn.classList.remove('hide');
  }

  // При покидании мыши области карты
  mouseOut(event) {
    event.preventDefault();
    const cardEl = event.target;
    const card = cardEl.classList.contains('card');
    
    if (!card) {
      return;
    }
    
    const currentEl = event.relatedTarget;
    if (currentEl === null) {
      return
    }

    if (!(card && currentEl.classList.contains('delete-btn'))) {
      const delBtn = cardEl.querySelector('.delete-btn');
      delBtn.classList.add('hide');
    }
  }

  // При нажатии мыши на область карты
  mouseDown(event) {
    const target = event.target;
      
    if (target.classList.contains('card')) {
      this.shiftX = event.offsetX;
      this.shiftY = event.offsetY;
      this.setDraggingElement(target);
      this.draggingElement.style = `
        left: ${event.pageX - this.shiftX}px;
        top: ${event.pageY - this.shiftY}px;
      `
      this.proectionAct(event)
    }

    if (target.closest('.delete-btn')) {
      PageLoad.deleteCard(target);
    }
  }

  // При перемещении карты
  mouseMove(event) {
    const target = event.target;
    if (this.draggingElement) {
      if (target.classList.contains('card')) {
        const delBtn = target.querySelector('.delete-btn');
        delBtn.classList.add('hide');
      }
      document.body.classList.add("grabbing");
      const { pageX, pageY } = event;
      const element = this.draggingElement;
      const  { width, height } = this.draggingElement.styles;
      element.styles = `
        position: absolute;
        left: ${pageX - this.shiftX}px;
        top: ${pageY - this.shiftY}px;
        pointer-events: none;
        width: ${width};
        height: ${height}; 
      `
    this.proectionAct(event);
    }
  }

  // Кнопка мыши отпущена 
  mouseUp() {
    if (this.draggingElement) {
      document.body.classList.remove("grabbing");
      this.replaceDragging();
      this.clear();
    }
  }

  setDraggingElement(node) {
    this.draggingElement = new Card(node); 
  }
  
  // Рассчёт позиции вставки проекции и вставка или удаление
  proectionAct(event) {
    const target = event.target;
    const element = this.draggingElement;
    const proection = this.draggingProection;
    const cards = target.closest('.cards');
    
    if (
      target.classList.contains('card') && !target.classList.contains('proection')
    ) {
        const { y, height } = target.getBoundingClientRect();
        const appendPosition = y + height / 2 > event.clientY
          ? 'beforebegin'
          : 'afterend';

        if (!proection) {
          this.draggingProection = element.proection;
        } else {
          proection.remove();
          target.insertAdjacentElement(appendPosition, proection);
        }
    }
    if (cards && cards.children.length === 0) {
      cards.append(proection);
    }
  }  

  replaceDragging() {
    this.draggingProection.replaceWith(this.draggingElement.element);
    this.draggingElement.element.style = this.draggingElement.styles;
  }

  clear() {
    this.draggingElement = null;
    this.draggingProection = null;
  }

  save() {
    const data = {
      todo: [],
      inProgress: [],
      done: [],
    };

    const toDoCards = this.toDo.querySelectorAll('.card');
    const inProgressCards = this.inProgress.querySelectorAll('.card');
    const doneCards = this.done.querySelectorAll('.card');

    toDoCards.forEach((item) => {
      data.todo.push(item.firstChild.textContent);
    });
    inProgressCards.forEach((item) => {
      data.inProgress.push(item.firstChild.textContent);
    });
    doneCards.forEach((item) => {
      data.done.push(item.firstChild.textContent);
    });

    this.stateService.save(data);
  }

  load() {
    const data = this.stateService.load();

    if (data) {
      data.todo.forEach((item) => {
        PageLoad.createCard(this.toDo, item);
      });
      data.inProgress.forEach((item) => {
        PageLoad.createCard(this.inProgress, item);
      });
      data.done.forEach((item) => {
        PageLoad.createCard(this.done, item);
      });
    }
  } 
}
