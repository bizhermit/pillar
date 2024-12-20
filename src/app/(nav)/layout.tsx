import { langFactory } from "@/i18n/next-factory";
import { HomeIcon, ListIcon, TodayIcon } from "@/react/elements/icon";
import Link from "@/react/elements/link";
import { Navigation } from "@/react/elements/navigation";
import { NavMenuLink } from "@/react/elements/navigation/menu";
import { ReactNode } from "react";
import { auth } from "~/auth";
import { SignOutButton } from "./layout-client";
import css from "./layout.module.scss";

type Props = {
  children: ReactNode;
};

const Layout = async ({ children }: Props) => {
  const session = await auth();
  const lang = await langFactory();

  if (!session?.user) return null;
  return (
    <Navigation
      header={<Header user={session.user} lang={lang} />}
      headerClassName={css.header}
      content={children}
    >
      <NavMenuLink
        url="/home"
        icon={<HomeIcon />}
      >
        {lang("menu.home")}
      </NavMenuLink>
      <NavMenuLink
        url="/calendar"
        icon={<TodayIcon />}
      >
        {lang("menu.calendar")}
      </NavMenuLink>
      <NavMenuLink
        url="/project"
        icon={<ListIcon />}
      >
        {lang("menu.project")}
      </NavMenuLink>
    </Navigation>
  );
};

type HeaderProps = {
  user: SignInUser;
  lang: LangAccessor;
};

const Header = async ({
  user,
  lang
}: HeaderProps) => {
  return (
    <div className={css.user}>
      <span>
        {user.name}
      </span>
      <Link
        href="/settings"
        button
        title={lang("menu.userSettings")}
      >
        {lang("menu.userSettings")}
      </Link>
      <div className={css.signout}>
        <SignOutButton />
      </div>
    </div>
  );
};

export default Layout;
