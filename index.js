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

  async function getDocumentTabs(envelopeId, documentId) {
    return request({
      method: 'GET',
      uri: `/envelopes/${envelopeId}/documents/${documentId}/tabs`,
    });
  }

  async function updateDocumentTabs(envelopeId, documentId, tabs) {
    return request({
      method: 'PUT',
      uri: `/envelopes/${envelopeId}/documents/${documentId}/tabs`,
      body: tabs,
    });
  }


  const envelopeId = await createEnvelopeFromTemplate();
  const { envelopeDocuments } = await listEnvelopeDocuments(envelopeId);
  const { documentId } = envelopeDocuments[0];
  const tabs = await getDocumentTabs(envelopeId, documentId);

  try {
    await updateDocumentTabs(envelopeId, documentId, tabs);
    console.log('Success!');
  } catch (e) {
    console.log(e.message);
  }
})();
