const url = 'https://harryliu.dev/';

describe('harryliu.dev', () => {
  beforeEach(() => {
    cy.visit(url);
  });

  describe('contact-form', () => {
    it('should return successful response on valid input', () => {
      cy.intercept('POST', '*', { times: 1 }).as('post');
      cy.get('#contact-form-name-input').type('username');
      cy.get('#contact-form-email-input').type('user@email.com');
      cy.get('#contact-form-message-input').type('message');
      cy.get('#contact-form-submit-button').click();
      cy.wait('@post').then(interception => {
        expect(interception.response?.statusCode).to.eq(200);
      });
    });
  });

  describe('subscribe-form', () => {
    it('should return successful response on valid input', () => {
      cy.intercept('POST', '*', { times: 1 }).as('post');
      cy.get('#subscribe-form-email-input').type('user@email.com');
      cy.get('#subscribe-form-submit-button').click();
      cy.wait('@post').then(interception => {
        expect(interception.response?.statusCode).to.eq(200);
      });
    });
  });
});
