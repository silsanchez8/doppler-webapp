import React from 'react';
import { render, cleanup, waitForDomChange } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DopplerIntlProvider from '../../../i18n/DopplerIntlProvider.double-with-ids-as-values';
import { AppServicesProvider } from '../../../services/pure-di';
import Shopify from './Shopify';
import { SubscriberListState } from '../../../services/shopify-client';

const oneShop = [
  {
    shopName: 'myshop.com',
    synchronization_date: new Date('2017-12-17'),
    list: {
      name: 'MyList',
      id: 1251,
      amountSubscribers: 2,
      state: 'SubscriberListState.ready',
    },
  },
];
const twoShops = [
  {
    shopName: 'myshop.com',
    synchronization_date: new Date('2017-12-17'),
    list: {
      name: 'MyList',
      id: 1251,
      amountSubscribers: 2,
      state: 'SubscriberListState.ready',
    },
  },
  {
    shopName: 'myshop2.com',
    synchronization_date: new Date('2017-12-17'),
    list: {
      name: 'MyList',
      id: 1251,
      amountSubscribers: 2,
      state: 'SubscriberListState.ready',
    },
  },
];

const emptyResponse = { success: true, value: [] };
const oneShopConnected = { success: true, value: oneShop };
const moreThanOneShopConnected = { success: true, value: twoShops };
const unexpectedErrorResponse = { success: false, message: 'Some random error' };

describe('Shopify Component', () => {
  afterEach(cleanup);

  it('should show not connected user data', async () => {
    const shopifyClientDouble = {
      getShopifyData: async () => emptyResponse,
    };
    const { container, getByText } = render(
      <AppServicesProvider
        forcedServices={{
          shopifyClient: shopifyClientDouble,
        }}
      >
        <DopplerIntlProvider>
          <Shopify />
        </DopplerIntlProvider>
      </AppServicesProvider>,
    );
    expect(container.querySelector('.loading-box')).toBeInTheDocument();
    await waitForDomChange();
    expect(getByText('shopify.header_disconnected_warning'));
  });

  it('should get connected user with one shop', async () => {
    const shopifyClientDouble = {
      getShopifyData: async () => oneShopConnected,
    };
    const { container, getByText } = render(
      <AppServicesProvider
        forcedServices={{
          shopifyClient: shopifyClientDouble,
        }}
      >
        <DopplerIntlProvider>
          <Shopify />
        </DopplerIntlProvider>
      </AppServicesProvider>,
    );
    expect(container.querySelector('.loading-box')).toBeInTheDocument();
    await waitForDomChange();
    expect(getByText(oneShopConnected.value[0].shopName));
  });

  it('should get connected user with one shop and one list in sync state', async () => {
    let syncList = { ...oneShopConnected };
    syncList.list = { ...oneShopConnected.list };
    syncList.list.state = SubscriberListState.synchronizingContacts;
    const shopifyClientDouble = {
      getShopifyData: async () => syncList,
    };
    const { container, getByText } = render(
      <AppServicesProvider
        forcedServices={{
          shopifyClient: shopifyClientDouble,
        }}
      >
        <DopplerIntlProvider>
          <Shopify />
        </DopplerIntlProvider>
      </AppServicesProvider>,
    );
    expect(container.querySelector('.loading-box')).toBeInTheDocument();
    await waitForDomChange();
    expect(getByText('common.synchronizing'));
  });

  it('should get connected user with more than one shop', async () => {
    const shopifyClientDouble = {
      getShopifyData: async () => moreThanOneShopConnected,
    };
    const { container, getByText } = render(
      <AppServicesProvider
        forcedServices={{
          shopifyClient: shopifyClientDouble,
        }}
      >
        <DopplerIntlProvider>
          <Shopify />
        </DopplerIntlProvider>
      </AppServicesProvider>,
    );
    expect(container.querySelector('.loading-box')).toBeInTheDocument();
    await waitForDomChange();
    expect(getByText(moreThanOneShopConnected.value[0].shopName));
    expect(getByText(moreThanOneShopConnected.value[1].shopName));
  });

  it('should manage unexpected errors', async () => {
    const shopifyClientDouble = {
      getShopifyData: async () => unexpectedErrorResponse,
    };
    const { container, getByText } = render(
      <AppServicesProvider
        forcedServices={{
          shopifyClient: shopifyClientDouble,
        }}
      >
        <DopplerIntlProvider>
          <Shopify />
        </DopplerIntlProvider>
      </AppServicesProvider>,
    );
    expect(container.querySelector('.loading-box')).toBeInTheDocument();
    await waitForDomChange();
    expect(getByText('validation_messages.error_unexpected_HTML'));
  });
});
