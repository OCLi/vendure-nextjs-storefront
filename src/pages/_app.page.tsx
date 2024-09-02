import React from 'react';
import '../styles/global.css';
import 'keen-slider/keen-slider.min.css';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { Nunito } from 'next/font/google';
import { Global, ThemeProvider } from '@emotion/react';
import { LightTheme } from '@/src/theme';
import { CartProvider } from '@/src/state/cart';
import { CheckoutProvider } from '@/src/state/checkout';
import { ProductProvider } from '@/src/state/product';
import { CollectionProvider } from '@/src/state/collection';
import { ChannelsProvider } from '../state/channels';

const nunito = Nunito({
    subsets: ['latin'], // Убедитесь, что указаны необходимые подмножества
    weight: ['400', '700'], // Добавьте веса шрифта, если это необходимо
    variable: '--nunito-font',
});

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <ThemeProvider theme={LightTheme}>
            <ChannelsProvider initialState={{ channel: pageProps.channel, locale: pageProps.locale }}>
                {/* Применение шрифта через Global стили */}
                <Global 
                    styles={`
                        :root { 
                            --nunito-font: ${nunito.style.fontFamily}; 
                        }
                        body { 
                            font-family: var(--nunito-font); 
                        }
                    `} 
                />
                {/* `checkout` prop should exist only on routes with checkout functionally */}
                {'checkout' in pageProps ? (
                    <CheckoutProvider initialState={{ checkout: pageProps.checkout }}>
                        <Component {...pageProps} />
                    </CheckoutProvider>
                ) : (
                    <CartProvider>
                        <ProductProvider
                            initialState={{
                                product: 'product' in pageProps ? pageProps.product : undefined,
                            }}>
                            <CollectionProvider
                                initialState={{
                                    collection: 'collection' in pageProps ? pageProps.collection : undefined,
                                    products: 'products' in pageProps ? pageProps.products : undefined,
                                    facets: 'facets' in pageProps ? pageProps.facets : undefined,
                                    totalProducts: 'totalProducts' in pageProps ? pageProps.totalProducts : undefined,
                                    filters: 'filters' in pageProps ? pageProps.filters : undefined,
                                    searchQuery: 'searchQuery' in pageProps ? pageProps.searchQuery : undefined,
                                    page: 'page' in pageProps ? pageProps.page : undefined,
                                    sort: 'sort' in pageProps ? pageProps.sort : undefined,
                                }}>
                                <Component {...pageProps} />
                            </CollectionProvider>
                        </ProductProvider>
                    </CartProvider>
                )}
            </ChannelsProvider>
        </ThemeProvider>
    );
};

export default appWithTranslation(App);
