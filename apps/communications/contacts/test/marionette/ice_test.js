'use strict';

var Contacts = require('./lib/contacts');
var Actions = require('marionette-client').Actions;
var assert = require('assert');

marionette('Contacts > ICE contacts', function() {
  var client = marionette.client(Contacts.config);
  var subject;
  var selectors;
  var actions = new Actions(client);

  function setFirstContactAsICE() {
    client.helper.waitForElement(selectors.settingsButton)
      .click();

    client.helper.waitForElement(selectors.setIceButton)
      .click();

    var iceSwitch1 = client.helper.waitForElement(selectors.iceSwitch1);
    subject.clickOn(iceSwitch1);

    var iceButton1 = client.helper.waitForElement(selectors.iceButton1);
    subject.clickOn(iceButton1);

    var listContactFirstText =
      client.helper.waitForElement(selectors.listContactFirstText);
    subject.clickOn(listContactFirstText);
  }

  setup(function() {
    subject = new Contacts(client);
    subject.launch();
    selectors = Contacts.Selectors;
  });

  suite('ICE contacts', function() {

    test('Check ICE settings transition', function() {

      client.helper.waitForElement(selectors.settingsButton)
        .click();

      client.helper.waitForElement(selectors.setIceButton)
        .click();

      var iceSwitch1 = client.helper.waitForElement(selectors.iceSwitch1);
      subject.clickOn(iceSwitch1);

      var iceButton1 = client.helper.waitForElement(selectors.iceButton1);
      subject.clickOn(iceButton1);

      var contactsHeader =
        client.helper.waitForElement(selectors.contactListHeader);

      actions.wait(0.5);

      actions.tap(contactsHeader, 10, 10).perform();

      var iceSwitch2 = client.helper.waitForElement(selectors.iceSwitch2);
      subject.clickOn(iceSwitch2);

      var iceButton2 = client.helper.waitForElement(selectors.iceButton2);
      subject.clickOn(iceButton2);

      actions.wait(0.5);

      actions.tap(contactsHeader, 10, 10).perform();

    });

    test('Clicking on ice button does not toggle the switch', function() {
      subject.addContact({
        givenName: 'Jose'
      });

      client.helper.waitForElement(selectors.settingsButton).click();
      var settings = client.helper.waitForElement(selectors.settingsView);
      subject.waitForSlideUp(settings);
      client.findElement(selectors.setIceButton).click();

      var iceButton1 = client.helper.waitForElement(selectors.iceButton1);
      subject.clickOn(iceButton1);
      var checked = client.executeScript(function(selector) {
        return document.querySelector(selector).checked;
      }, [selectors.iceInputSwitch1]);
      assert.ok(!checked);
    });

  });

  suite('ICE list', function() {

    function checkIceContactsGroupHidden() {
      return client.executeScript(function(selector) {
        return document.querySelector(selector).classList.contains('hide');
      }, [selectors.iceGroupOpen]);
    }

    test('ICE list empty after removing phone', function() {

      var contact = {
        givenName: 'Raul Gonzalez Blanco',
        tel: '123123123'
      };

      subject.addContact(contact);

      setFirstContactAsICE();

      // Pressing back button to go back to settings
      var contactsHeader = client.helper.
                                  waitForElement(selectors.contactListHeader);
      actions.wait(0.5)
             .tap(contactsHeader, 10, 10)
             .perform();

      // Closing settings view
      var closeSettings = client.helper.waitForElement(selectors.settingsClose);
      subject.clickOn(closeSettings);

      // Click on ICE contacts item in the main list
      var openIce = client.helper.waitForElement(selectors.iceGroupOpen);
      subject.clickOn(openIce);

      // Go to details for this contact
      var iceContact = client.helper.waitForElement(selectors.iceContact);
      subject.clickOn(iceContact);

      // Pressing the button to edit the contact
      var edit = client.helper.waitForElement(selectors.detailsEditContact);
      subject.clickOn(edit);

      // Waiting for edit view
      subject.waitForFormShown();

      // Deleting the first phone number
      client.findElement(selectors.formDelFirstTel).click();

      // Save the changes when the 'Update' button is enabled
      var save = client.findElement(selectors.formSave);
      save.enabled();
      save.click();

      // The user is aware of his contact will be deleted from ICE Contacts
      client.helper.waitForElement(selectors.confirmDismiss).click();

      // Go from detail to ICE list
      var detailsHeader = client.helper.waitForElement(selectors.detailsHeader);
      actions.wait(0.5)
             .tap(detailsHeader, 10, 10)
             .perform();

      client.helper.waitForElement(selectors.contactListHeader);

      assert.ok(checkIceContactsGroupHidden());
    });

  });

});
