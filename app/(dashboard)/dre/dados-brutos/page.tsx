// app/(dashboard)/dre/dados-brutos/page.tsx

import { memo } from "react";
import RawDataClient from "./client";

export default memo(function RawDataPage() {
  return (
    <>
      <RawDataClient />
    </>
  );
});
