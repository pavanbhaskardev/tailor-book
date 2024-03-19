"use client";
import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  ChangeEvent,
  MutableRefObject,
} from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/16/solid";
import { isEmpty } from "ramda";
import { ArrowPathIcon, InboxIcon } from "@heroicons/react/24/solid";
import debounce from "lodash.debounce";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Search from "@/components/Search";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import axiosConfig from "@/utils/axiosConfig";
import { OrderDetailsType } from "@/utils/interfaces";
import OrderCard from "@/components/OrderCard";

// this will call the refetch fn after a debounce
const handleDebounce = debounce((refetch) => {
  refetch();
}, 800);

const Page = () => {
  const { user } = useUser();
  const observer = useRef<IntersectionObserver>(
    null
  ) as MutableRefObject<IntersectionObserver>;
  const [searchWord, setSearchWord] = useState("");

  const createNewUser = async () => {
    try {
      const response = await axiosConfig({
        url: "api/user",
        method: "POST",
        data: {
          id: user?.id,
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          incrementOrder: "false",
        },
      });

      return response?.data?.data;
    } catch (error) {
      console.log({ error });
      return error;
    }
  };

  const getAllOrders = async ({
    pageParam,
    signal,
  }: {
    pageParam: number;
    signal: AbortSignal;
  }) => {
    try {
      const response = await axiosConfig({
        url: "api/orders",
        method: "GET",
        params: {
          userId: user?.id,
          limit: 10,
          offset: pageParam,
          searchWord,
        },
        signal,
      });

      return response?.data?.data;
    } catch (error) {
      throw new Error(`failed to get orders ${error}`);
    }
  };

  // this hook is to create a new user in mongoDB
  useQuery({
    queryKey: ["user-details"],
    queryFn: createNewUser,
    enabled: user ? true : false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["order-list"],
    queryFn: ({ pageParam, signal }) => getAllOrders({ pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 10) {
        return allPages.length * 10;
      }

      return undefined;
    },
    staleTime: 0,
    enabled: user ? true : false,
  });

  const orderData = useMemo(() => {
    if (data && Array.isArray(data?.pages)) {
      return data.pages.flat();
    } else {
      return [];
    }
  }, [data]);

  // this is for infinite query
  const lastElement = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasNextPage) {
        return;
      }

      if (isFetchingNextPage) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio > 0) {
          fetchNextPage();
        }
      });

      observer.current.observe(node);
    },
    [data, isFetchingNextPage]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchWord(e.target.value);

    handleDebounce(refetch);
  };

  return (
    <section className="relative no-scrollbar">
      <Search
        className="mt-1 mb-4"
        value={searchWord}
        placeholder="Search"
        onChange={handleChange}
        spin={(isLoading || isFetchingNextPage) && !isEmpty(searchWord)}
      />

      {isLoading && (
        <div className="flex w-screen justify-center items-center h-[60vh] sm:max-w-2xl">
          <ArrowPathIcon
            height={24}
            width={24}
            className="animate-spin fill-muted-foreground"
          />
        </div>
      )}

      {!isEmpty(orderData) && !isLoading ? (
        <>
          {orderData.map((details: OrderDetailsType, index) => (
            <OrderCard
              details={details}
              index={index}
              key={details?.orderId}
              lastElement={orderData.length === index + 1 ? lastElement : null}
            />
          ))}

          {isFetchingNextPage && (
            <ArrowPathIcon
              height={24}
              width={24}
              className="animate-spin fill-muted-foreground mx-auto"
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
          <InboxIcon height={40} width={40} className="fill-muted-foreground" />
          <p className="text-muted-foreground">No order created</p>
        </div>
      )}

      <Button
        size="icon"
        className="fixed bottom-2 right-2 w-12 h-12 sm:right-4 sm:bottom-4"
        asChild
      >
        <Link href="/create-order">
          <PlusIcon height={24} width={24} />
        </Link>
      </Button>
    </section>
  );
};

export default Page;
