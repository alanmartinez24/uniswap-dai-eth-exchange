describe('Swap', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should have zero amounts in both inputs at the beginning', () => {
    cy.get('.crypto-input-DAI').should('have.value', '0.0')
    cy.get('.crypto-input-ETH').should('have.value', '0.0')
  })

  it('should show balances', () => {
    cy.get('.crypto-input-wrapper-DAI').should('contain', 'Balance:')
    cy.get('.crypto-input-wrapper-ETH').should('contain', 'Balance:')
  })

  it('should show a button for maximum amount of DAI', () => {
    cy.get('.crypto-input-wrapper-DAI .btn-swap-max-dai').should('be.visible')
  })

  it('should update the amount of ETH when the amount of DAI is updated', () => {
    cy.get('.crypto-input-DAI').clear().type('1000')
    cy.get('.crypto-input-ETH').should('not.have.value', '0.0')
  })

  it('should update the amount of DAI when the amount of ETH is updated', () => {
    cy.get('.crypto-input-ETH').clear().type('1.0')
    cy.get('.crypto-input-DAI').should('not.have.value', '0.0')
  })

  it('should show error message when zero amount of DAI is being swapped', () => {
    cy.get('.btn-swap').click()
    cy.get('#notistack-snackbar').should('contain', 'You should input positive amount of DAI to swap.')
  })
})
