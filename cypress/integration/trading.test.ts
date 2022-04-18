describe('Swap', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should have zero amounts in both inputs at the beginning', () => {
    cy.get('.crypto-input-DAI').should('have.value', '0.0')
  })
})
