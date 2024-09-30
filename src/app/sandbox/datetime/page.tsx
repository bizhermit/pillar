import { DatetimeFetchButton, DatetimeListAsClient } from "./client";
import { DateTimeList } from "./components";

const Page = () => {
  return (
    <div style={{ fontSize: "1.2rem" }}>
      <DatetimeFetchButton />
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px"
      }}>
        <DateTimeList />
        <DatetimeListAsClient />
      </div>
    </div>
  );
};

export default Page;
