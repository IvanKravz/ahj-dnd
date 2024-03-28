export default class PageLoad {
  constructor(data) {
    this.data = data;
    this.container = null;
    this.cardsContainer = null;
    this.addCards = null;
    this.forms = null;
    this.cancelBtns = null;
    this.inputs = null;
    this.cards = null;
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement"');
    }
    this.container = container;
  }

  drawUi() {
    this.cardsContainer = document.createElement('div');
    this.cardsContainer.classList.add('cards-container');
    this.container.append(this.cardsContainer);

    this.data.forEach((item) => {
      const cardsHTML = document.createElement('div');
      cardsHTML.id = `${item.id}`;
      cardsHTML.classList.add('cards-col');
      cardsHTML.innerHTML = `<p class="card-title">${item.title}</p>\n`
        + '                   <div class="cards"></div>\n'
        + '                   <div class="add-card">+ Add another card</div>\n'
        + '                   <form class="new-card-form">\n'
        + '                     <input type="text" class="card-input" placeholder="Enter a title for this card..." required>\n'
        + '                     <div class="button-container">\n'
        + '                       <button class="add-btn" type="submit">Add card</button>\n'
        + '                       <button class="cancel-btn">&#x2715;</button>\n'
        + '                     </div>\n'
        + '                   </form>\n';
      this.cardsContainer.append(cardsHTML);
    });

    this.addCards = this.container.querySelectorAll('.add-card');
    this.forms = this.container.querySelectorAll('.new-card-form');
    this.cancelBtns = this.container.querySelectorAll('.cancel-btn');
    this.inputs = this.container.querySelectorAll('.card-input');
    this.cards = this.container.querySelector('.card');
  }

  static createCard(column, value) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = value;
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.classList.add('hide')
    deleteButton.innerHTML = '&#x2716'
    card.append(deleteButton)
    column.append(card);
  }

  static deleteCard(event) {
    event.parentElement.remove();
  }

  elemDOM() {
    if (this.container === null) {
      throw new Error('container is not bind to DOM');
    }
  }
}
