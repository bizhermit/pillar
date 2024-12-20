// Pages Router

type PageWithLayout<P = {}, IP = P> = import("next").NextPage<P, IP> & {
  layout?: (page: React.ReactElement, props: P) => React.ReactNode;
};

// App Router

type NextPageParams = { [key: string]: string | string[] | undefined; };
type NextPageArgParams<T> = Promise<EscapeNull<T, NextPageParams>>;

type ServerPage<P extends {
  params?: NextPageParams;
  searchParams?: NextPageParams;
} = { params: NextPageParams; searchParams: NextPageParams; }> = (props: {
  params: NextPageArgParams<P["params"]>;
  searchParams: NextPageArgParams<P["searchParams"]>;
}) => (React.ReactNode | Promise<React.ReactNode>);

type ClientPage<P extends {
  params?: NextPageParams;
  searchParams?: NextPageParams;
} = { params: NextPageParams; searchParams: NextPageParams; }> = (props: {
  params: NextPageArgParams<P["params"]>;
  searchParams: NextPageArgParams<P["searchParams"]>;
}) => React.ReactNode;

type ServerLayout<P extends {
  params?: NextPageParams;
  searchParams?: NextPageParams;
  parallel?: string;
} = { params: NextPageParams; searchParams: NextPageParams; }> = (props: {
  params: NextPageArgParams<P["params"]>;
  searchParams: NextPageArgParams<P["searchParams"]>;
  children: React.ReactNode;
} & Record<P["parallel"], React.ReactNode>) => (React.ReactNode | Promise<React.ReactNode>);

type ClientLayout<P extends {
  params?: NextPageParams;
  searchParams?: NextPageParams;
  parallel?: string;
} = {}> = (props: {
  params: NextPageArgParams<P["params"]>;
  searchParams: NextPageArgParams<P["searchParams"]>;
  children: React.ReactNode;
} & Record<P["parallel"], React.ReactNode>) => React.ReactNode;

type ErrorFC = (props: {
  error: Error & { digest?: string };
  reset: () => void;
}) => React.ReactNode;
