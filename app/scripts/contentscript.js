'use strict';

(function () {

  function getNodeArray(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function removeDisplayStyle (selector) {
    getNodeArray(selector).forEach(function (el) {
      el.style.removeProperty('display');
    });
  }

  function hidePointlessElements () {
    var selectors = [
      '#middle > p',
      '#middle form tr[id^="delayDetails_container_id_"] td span',
      '#middle form tr[id^="photocard_container_id_"]'
    ];

    selectors.forEach(function (selector) {
      getNodeArray(selector).forEach(function (el) {
        el.className += 'pointless';
      });
    });

    getNodeArray('#middle form p:not([id*="_"])')
      .forEach(function (el) {
        if (el.querySelectorAll('input[name="compensation"]').length === 0) {
          el.className += 'pointless';
        }
      });

    getNodeArray('#middle form tr[id^="photocard_container_id_"]')
      .forEach(function (el) {
        el.nextElementSibling.className += 'pointless';
      });
  }

  function showImportantElements () {
    removeDisplayStyle('#middle form tr[id^="photocard_container_id_"]');
    removeDisplayStyle('#middle form tr[id^="previousUploadedTicket_"]');
    removeDisplayStyle('#middle form tr[id^="delayDetails_container_id_"]');
    removeDisplayStyle('#middle form tr[id^="delayDetails_container_id_"] td span');
  }

  function rearrangeElements () {
    var submit = document.querySelector('#middle form input[id="imageField"]');
    var mainContainer = document.querySelector('#middle .whitebox02 .box');
    mainContainer.appendChild(submit);
  }

  function cleanTicketType () {
    Q.xhr.get(chrome.extension.getURL("templates/ticket-type.hbs"))
      .then(function (resp) {
        var template = Handlebars.compile(resp.data);

        getNodeArray('#middle form select[id^="ticket_type_"]')
          .forEach(function (old, index) {
            var hEl = template({
              index: index + 1,
              options: [
                {value: 'annual', text: 'Annual'},
                {value: 'monthly', text: 'Monthly'},
                {value: 'weekly', text: 'Weekly'},
                {value: 'other', text: 'Other'}
              ]
            });

            var el = document.createElement('div');
            el.innerHTML = hEl;

            old.parentElement.replaceChild(el.firstChild, old);
          });
      });
  }

  function cleanDelayReason () {
    getNodeArray('#middle form select[id^="delayReason_"]')
      .forEach(function (el) {
        el.value = 'Other';

        // the select element and its label
        el.parentElement.parentElement.className += 'pointless';
      });
  }

  function cleanPreviousUploadedTicket () {
    getNodeArray('#middle form input[id^="previouslyProvided_"]')
      .forEach(function (el) {
        el.checked = true;

        var tr = el.parentElement.parentElement;
        tr.className += 'pointless';
        tr.previousElementSibling.className += 'pointless';
      });
  }

  function cleanUploadedFile () {
    getNodeArray('#middle form input[name^="uploadedfile_"]')
      .forEach(function (el) {
        el.parentElement.parentElement.className += 'pointless';
      });
  }

  function cleanDelayDetails () {
    Q.xhr.get(chrome.extension.getURL("templates/smartcard-number.hbs"))
      .then(function (resp) {
        var template = Handlebars.compile(resp.data);

        getNodeArray('#middle form tr[id^="delayDetails_container_id_"]')
          .forEach(function (container, index) {
            container.previousElementSibling.className += 'pointless';

            var label = container.querySelector('label > strong');
            label.innerText = "Smartcard Number";

            var hEl = template({
              index: index + 1
            });

            var el = document.createElement('div');
            el.innerHTML = hEl;

            var field = el.firstChild;

            var textArea = container.querySelector('textarea');
            textArea.parentElement.replaceChild(field, textArea);

            // move element further up the form.
            var target = document.querySelector('#middle form #photocard_container_id_' + (index+1));
            target.parentNode.insertBefore(container, target.previousSibling);

            // fill in the photocard id field with last eight chars of smartcard
            field.addEventListener('change', function () {
              target.querySelector('#photocard_id_' + (index+1)).value = this.value.substring(this.value.length - 8);
            });
          });
      });
  }

  function clean () {
    rearrangeElements();
    hidePointlessElements();
    showImportantElements();
    cleanTicketType();
    cleanDelayReason();
    cleanDelayDetails();
    cleanPreviousUploadedTicket();
    cleanUploadedFile();
  }

  clean();
})();
