'use strict';

require('dotenv').config();

const {
  BASE_URL,
  ACCOUNT_ID,
  ACCESS_TOKEN,
  TEMPLATE_ID
} = process.env;

const request = require('request-promise-native').defaults({
  baseUrl: `${BASE_URL}/accounts/${ACCOUNT_ID}`,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
  json: true,
});

(async () => {
  if (!BASE_URL || !ACCOUNT_ID || !ACCESS_TOKEN || !TEMPLATE_ID) {
    console.error('Need all env vars.');

    return;
  }

  async function createEnvelopeFromTemplate() {
    const { envelopeId } = await request({
      method: 'POST',
      uri: '/envelopes',
      headers: {
      },
      body: {
        status: 'created',
        emailSubject: 'Please sign',
        templateId: TEMPLATE_ID,
      },
    });

    return envelopeId;
  }

  async function listEnvelopeDocuments(envelopeId) {
    return request({
      method: 'GET',
      uri: `/envelopes/${envelopeId}/documents`
    });
  }

  // https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeDocumentTabs/get
  async function getDocumentTabs(envelopeId, documentId) {
    return request({
      method: 'GET',
      uri: `/envelopes/${envelopeId}/documents/${documentId}/tabs`,
    });
  }

  // https://developers.docusign.com/esign-rest-api/reference/Envelopes/EnvelopeDocumentTabs/update
  async function updateDocumentTabs(envelopeId, documentId, tabs) {
    return request({
      method: 'PUT',
      uri: `/envelopes/${envelopeId}/documents/${documentId}/tabs`,
      body: tabs,
    });
  }

  async function updateRecipientTabs(envelopeId, recipientId, tabs) {
    return request({
      method: 'PUT',
      uri: `/envelopes/${envelopeId}/recipients/${recipientId}/tabs`,
      body: tabs
    });
  }

  const envelopeId = await createEnvelopeFromTemplate();
  const { envelopeDocuments } = await listEnvelopeDocuments(envelopeId);
  const { documentId } = envelopeDocuments[0];

  const tabs = await getDocumentTabs(envelopeId, documentId);

  const date = new Date().getTime().toString();

  tabs['textTabs'][0].value = date;

  // Updating all the tabs at once doesn't work
  try {
    await updateDocumentTabs(envelopeId, documentId, tabs);
    console.log('Success!');
  } catch (e) {
    console.log(e.message);
  }

  // Updating the tabs for a single recipient does work
  await updateRecipientTabs(envelopeId, tabs['textTabs'][0]['recipientId'], tabs);

  const newTabs = await getDocumentTabs(envelopeId, documentId);

  console.log(newTabs['textTabs'][0]['value'] === date);
})();
