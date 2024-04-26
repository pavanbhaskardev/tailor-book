"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  MutableRefObject,
  Fragment,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Search from "@/components/Search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/components/Svg";
import CustomerOption from "./components/CustomerOption";
import { getOldCustomersList } from "@/utils/commonApi";
import { useAuth } from "@clerk/nextjs";
import { isEmpty } from "ramda";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { CustomerDetails } from "@/utils/interfaces";
import useDebounce from "@/utils/useDebounce";

const Page = () => {
  const [sortBy, setSortBy] = useState("asc");
  const [searchWord, setSearchWord] = useState("");
  const debouncedValue = useDebounce({ delay: 800, value: searchWord });
  const { userId } = useAuth();
  const observer = useRef<IntersectionObserver>(
    null
  ) as MutableRefObject<IntersectionObserver>;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["old-customers-list", sortBy, debouncedValue],
      queryFn: ({ pageParam, signal }) =>
        getOldCustomersList({
          id: userId as string,
          offset: pageParam,
          limit: 10,
          signal,
          searchWord: debouncedValue,
          sortBy,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 10) {
          return allPages.length * 10;
        }

        return undefined;
      },
      gcTime: Infinity,
      enabled: userId ? true : false,
    });

  const formattedData = useMemo(() => {
    if (data && Array.isArray(data.pages) && !isEmpty(data.pages || [])) {
      // doing a lowercase and comparing
      const list = data.pages.flat();

      // handling the case when list is empty
      if (isEmpty(list)) {
        return {};
      }

      // forming the data structure
      return list.reduce((acc, customer) => {
        const firstLetter = customer.name[0].toUpperCase();
        acc[firstLetter] = acc[firstLetter] || [];
        acc[firstLetter].push(customer);
        return acc;
      }, {});
    } else {
      return {};
    }
  }, [data]);

  // this is for infinite query
  const lastElement = useCallback(
    (node: HTMLAnchorElement | null) => {
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
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  const totalLength = Object.keys(formattedData).length;

  return (
    <section className="space-y-4">
      <div className="flex gap-2 w-full">
        <Search
          placeholder="Search"
          value={searchWord}
          className="flex-grow"
          onChange={(e) => setSearchWord(e.target.value)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <FilterIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-24" align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <DropdownMenuRadioItem value="asc">A to Z</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">Z to A</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading && (
        <div className="flex w-screen justify-center items-center h-[60vh] sm:max-w-2xl">
          <ArrowPathIcon
            height={24}
            width={24}
            className="animate-spin fill-muted-foreground"
          />
        </div>
      )}

      {!isLoading && !isEmpty(formattedData) && (
        <div className="h-[calc(100vh-124px)] overflow-y-scroll no-scrollbar">
          {Object.keys(formattedData).map((key, index) => {
            return (
              <Fragment key={index + key}>
                <div className="w-full sticky top-0 z-10 text-muted-foreground font-medium bg-[#121212]">
                  {key}
                </div>

                {formattedData[key].map(
                  (details: CustomerDetails, uniqueKey: number) => {
                    return (
                      <CustomerOption
                        details={details}
                        key={uniqueKey + details.customerId}
                        lastElement={
                          totalLength === index + 1 &&
                          uniqueKey + 1 === formattedData[key].length
                            ? lastElement
                            : null
                        }
                      />
                    );
                  }
                )}
              </Fragment>
            );
          })}

          {isFetchingNextPage && (
            <ArrowPathIcon
              height={24}
              width={24}
              className="animate-spin fill-muted-foreground mx-auto"
            />
          )}
        </div>
      )}

      {!isLoading && isEmpty(formattedData) && (
        <p className="text-center">No results found!</p>
      )}
    </section>
  );
};

export default Page;
