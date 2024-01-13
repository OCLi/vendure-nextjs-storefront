// import nextI18nextConfig from '@/next-i18next.config';
import { i18n } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import resources from '@/src/@types/resources';
import { GetServerSidePropsContext } from 'next';
import { channels } from './consts';
import { getContext } from './utils';

export interface ContextModel<T = Record<string, string>> {
    params: { locale: string; channel: string } & T;
}

const getAllPossibleWithChannels = () => {
    const paths: { params: { locale?: string; channel: string } }[] = [];
    channels.forEach(c => {
        c.locales.forEach(locale => {
            paths.push({ params: { channel: c.slug, locale } });
        });
        // paths.push({ params: { channel: c.slug, locale: c.nationalLocale } });
    });
    console.log(paths);
    return paths;
};

const getStandardLocalePaths = () => {
    const paths: { params: { locale?: string; channel: string } }[] = [];
    channels.forEach(c => {
        c.locales.forEach(locale => {
            paths.push({ params: { channel: c.slug, locale } });
        });
        // paths.push({ params: { channel: c.slug, locale: c.nationalLocale } });
    });
    console.log(paths);
    return paths;
};

export const localizeGetStaticPaths = <T>(
    existingPaths: Array<{
        params: T;
    }>,
) => {
    const allPaths = getAllPossibleWithChannels();
    const paths = allPaths.flatMap(locale =>
        existingPaths.map(ep => ({
            ...ep,
            params: { ...ep.params, ...locale.params },
        })),
    );
    return paths;
};

export async function getI18nProps(ctx: ContextModel, ns: Array<keyof typeof resources> = ['common']) {
    const locale = ctx?.params?.locale;
    if (process.env.NODE_ENV === 'development') await i18n?.reloadResources();

    const props = {
        ...(await serverSideTranslations(locale, ns)),
    };

    return props;
}

export function makeStaticProps(ns: Array<keyof typeof resources>) {
    return async function getStaticProps(ctx: ContextModel) {
        const context = getContext(ctx);
        return {
            props: await getI18nProps(context, ns),
            context: {
                channel: context.params.channel,
                locale: context.params.locale,
            },
        };
    };
}

export function makeServerSideProps(ns: Array<keyof typeof resources>) {
    return async function getServerSideProps(ctx: GetServerSidePropsContext) {
        const context = getContext(ctx);
        return {
            props: await getI18nProps(context, ns),
            context: {
                channel: context.params.channel,
                locale: context.params.locale,
            },
        };
    };
}

export const getStaticPaths = () => ({
    fallback: false,
    paths: getStandardLocalePaths(),
});

export const prepareSSRRedirect = (where: string) => (context: GetServerSidePropsContext) => {
    const locale = context.params?.locale || 'en';
    const destination = locale === 'en' ? `${where}` : `/${context.params?.locale}${where}`;
    return { redirect: { destination, permanent: false } };
};
