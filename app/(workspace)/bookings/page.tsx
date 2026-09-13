import { Suspense } from "react";
import { Bookings } from "@/components/bookings";
import { Loading } from "@/components/ui/controls";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Bookings />
    </Suspense>
  );
}
