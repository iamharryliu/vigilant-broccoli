/// <reference types="cypress" />

describe('harryliu.design', () => {
  beforeEach(() => {
    cy.visit('https://harryliu.design/');
  });

  describe('contact-form', () => {
    it('displays two todo items by default', () => {
      cy.get('#contact-form-name-input').type('username');
      cy.get('#contact-form-email-input').type('user@email.com');
      cy.get('#contact-form-message-input').type('message');
      cy.get('#contact-form-submit-button').click();
    });
  });

  describe('subscribe-form', () => {
    it('displays two todo items by default', () => {
      cy.get('#subscribe-form-email-input').type('user@email.com');
      cy.get('#subscribe-form-submit-button').click();
    });
  });
});
