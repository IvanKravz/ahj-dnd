import PageLoad from './PageLoad';
import cursors from './cursors';

export default class PageController {
  constructor(pageLoad, stateService) {
    this.pageLoad = pageLoad;
    this.stateService = stateService;
    this.shiftX = null;
    this.shiftY = null;
    this.dragEl = null;
    this.cloneEl = null;
    this.toDo = null;
    this.inProgress = null;
    this.done = null;
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

    this.pageLoad.cardsContainer.addEventListener('mouseover', (event) => {
      event.preventDefault();

      const card = event.target.classList.contains('card');
      if (!card) {
        return;
      }
      const cardEl = event.target;
      const delBtn = cardEl.querySelector('.delete-btn');
      delBtn.classList.remove('hidden');
    });

    this.pageLoad.cardsContainer.addEventListener('mouseout', (event) => {
      event.preventDefault();

      const card = event.target.classList.contains('card');
      if (!card) {
        return;
      }
    });

    this.pageLoad.cardsContainer.addEventListener('mousedown', (event) => {
      const targetCard = event.target;

      if (targetCard.closest('.card')) {
        this.startDrag(event);
      }

      if (targetCard.closest('.delete-btn')) {
        PageLoad.deleteCard(targetCard);
      }
    });

    document.addEventListener('mousemove', (event) => {
      this.moveAt(event);
    });
    document.addEventListener('mouseup', (event) => {
      this.finishDrag(event);
    });
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

  startDrag(event) {
    const targetCard = event.target.closest('.card');
    if (!targetCard || event.target.classList.contains('delete-btn')) {
      return;
    }
    event.preventDefault();

    document.body.style.cursor = cursors.drag;
    
    this.pageLoad.cards.forEach((elem) => {
      elem.style.cursor = cursors.drag;
    });

    this.pageLoad.addCards.forEach((elem) => {
      elem.style.cursor = cursors.drag;
    })

    this.dragEl = targetCard;
    this.cloneEl = this.dragEl.cloneNode(true);

    this.shiftX = event.clientX - this.dragEl.getBoundingClientRect().left;
    this.shiftY = event.clientY - this.dragEl.getBoundingClientRect().top;

    this.cloneEl.style.width = `${this.dragEl.offsetWidth}px`;
    this.cloneEl.style.height = `${this.dragEl.offsetHeight}px`;
    this.cloneEl.classList.add('dragged');
    this.dragEl.classList.add('hidden');
    document.body.append(this.cloneEl);

    this.cloneEl.style.left = `${event.clientX - this.shiftX}px`;
    this.cloneEl.style.top = `${event.clientY - this.shiftY}px`;
  }

  moveAt(event) {
    event.preventDefault();

    if (!this.cloneEl) {
      return;
    }

    let newX = event.clientX - this.shiftX;
    let newY = event.clientY - this.shiftY;

    const newBottom = newY + this.cloneEl.offsetHeight;

    if (newBottom > document.documentElement.clientHeight) {
      const docBottom = document.documentElement.getBoundingClientRect().bottom;
      let scrollY = Math.min(docBottom - newBottom, 10);

      if (scrollY < 0) scrollY = 0;

      window.scrollBy(0, scrollY);

      newY = Math.min(newY, document.documentElement.clientHeight - this.cloneEl.offsetHeight);
    }

    if (newY < 0) {
      let scrollY = Math.min(-newY, 10);
      if (scrollY < 0) scrollY = 0;

      window.scrollBy(0, -scrollY);

      newY = Math.max(newY, 0);
    }

    if (newX < 0) newX = 0;
    if (newX > document.documentElement.clientWidth - this.cloneEl.offsetWidth) {
      newX = document.documentElement.clientWidth - this.cloneEl.offsetWidth;
    }

    this.cloneEl.style.left = `${newX}px`;
    this.cloneEl.style.top = `${newY}px`;
  }

  finishDrag(event) {
    if (!this.dragEl) {
      return;
    }
    const targetPos = document.elementFromPoint(event.clientX, event.clientY);

    if (!targetPos) {
      this.endingDrag();
      return;
    }

    const targetCards = targetPos.closest('.cards');

    if (targetCards === null) {
      this.dragEl.parentElement.append(this.dragEl);
    } else if (targetCards && targetCards === targetPos) {
      targetCards.append(this.dragEl);
    } else if (targetCards && targetCards !== targetPos) {
      const card = targetPos.closest('.card');
      card.after(this.dragEl);
    }
    this.endingDrag();
  }

  endingDrag() {
    document.body.style.cursor = cursors.auto;
    this.pageLoad.addCards.forEach((elem) => {
      elem.style.cursor = '';
    });
    this.pageLoad.cards.forEach((elem) => {
      elem.style.cursor = cursors.auto;
    });
    this.cloneEl.remove();
    this.dragEl.classList.remove('hidden');
    this.dragEl = null;
    this.cloneEl = null;
  }
}
