Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    if (err.message.includes(' Cannot read properties of undefined')) {
        return false;
    }
    return false;
});

describe('The ZTM4People testing', () => {
    it('successfully loads', () => {
        cy.visit('https://ekaterinatrofa.github.io/ZTM4People/');
        cy.wait(5000);
    });

    it('location', () => {
        cy.location().should((loc) => {
            expect(loc.origin).to.eq('https://ekaterinatrofa.github.io');
            expect(loc.pathname).to.eq('/ZTM4People/');
            expect(loc.protocol).to.eq('https:');
            expect(loc.host).to.eq('ekaterinatrofa.github.io');
            expect(loc.toString()).to.eq(
                'https://ekaterinatrofa.github.io/ZTM4People/'
            );
            expect(loc.href).to.eq(
                'https://ekaterinatrofa.github.io/ZTM4People/'
            );
        });
    });

    it('asserts', () => {

        cy.get('label').should('contain', 'Filtruj po linii:');
        cy.get('#lines_filter').should('contain', 'Wybierz linię...');
        cy.get('title').contains('ztmForPeople', { matchCase: false });
        cy.get('button').contains('Wyczyść filtrowanie');
        cy.get('#messages_div').should('have.css', 'width');
        cy.get('#filter_div').should('have.css', 'height');
        cy.get('#vehicle_type').should('have.text', 'Wyświetl tylko autobusy');
        cy.title().its('length').should('eq', 12);

    });

    it('clicks', () => {
        cy.get('button[id="vehicle_type"]').click();
        cy.wait(4000);
        cy.get('button[id="vehicle_type"]').click();
        cy.wait(2000);
        cy.get('div[class="leaflet-pane leaflet-marker-pane"]').find('img').first().click({ force: true });
        cy.wait(2000);

        cy.get('#lines_filter').select('8 Stogi - Jelitkowo');

        cy.wait(3000);
        cy.get('button').last().click();
    });

    it('zoom', () => {
        cy.wait(3000);
        cy.get('.leaflet-control-zoom-in').click();
        cy.wait(3000);
        cy.get('.leaflet-control-zoom-out').click();
        cy.wait(3000);
    });

    it('reload page', () => {
        cy.reload();
    });

});


