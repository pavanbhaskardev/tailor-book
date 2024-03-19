"use client";
import React, { useState, useRef, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/16/solid";
import useSound from "use-sound";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { v4 as uuidv4 } from "uuid";
import { SizeList } from "@/utils/interfaces";

interface SizeDrawerProps {
  name: string;
  children: React.ReactNode;
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  sizeList: SizeList[];
  setSizeList: React.Dispatch<React.SetStateAction<SizeList[]>>;
  onDrawerClose: () => void;
}

const sizeOptions = [
  {
    name: "1/4",
    value: 0.25,
  },
  {
    name: "1/2",
    value: 0.5,
  },
  {
    name: "3/4",
    value: 0.75,
  },
];

// this return the decimal sizes in readable format
export const formatSize = (value: number) => {
  switch (value) {
    case 0.25:
      return "1/4";
    case 0.5:
      return "1/2";
    case 0.75:
      return "3/4";
    default:
      return "";
  }
};

interface EditInterface {
  status: boolean;
  id: string;
}

const SizeDrawer = ({
  name,
  children,
  size,
  setSize,
  sizeList,
  setSizeList,
  onDrawerClose,
}: SizeDrawerProps) => {
  const containerRef = useRef(null);
  const [onHold, setOnHold] = useState<EditInterface>({
    status: false,
    id: "",
  });
  const [isEdit, setIsEdit] = useState<EditInterface>({
    status: false,
    id: "",
  });
  const activeHoldRef = useRef(null);
  // these are for sound interaction
  const [play] = useSound("/sounds/list_removal_sound.mp3", { volume: 0.25 });
  const [playAddListSound] = useSound("/sounds/list_add_sound.mp3", {
    volume: 0.4,
  });

  // this is to show which size to show based on the edit status
  const editSize = [...sizeList].filter(({ id }) => id === isEdit.id);
  const activeSize = isEdit.status ? editSize[0].size : size;

  // onHold functionality is achieved here
  useEffect(() => {
    // the editing status is set to true only on when it's first time it's selected
    if (onHold.status && !isEdit.status) {
      activeHoldRef.current = setTimeout(() => {
        setIsEdit({ status: true, id: onHold.id });
      }, 500);
    }

    // Clear the timeout when component unmounts or when onHold changes
    return () => {
      clearTimeout(activeHoldRef.current);
    };
  }, [onHold.status, onHold.id]);

  // this handles removing the size
  const removeSize = (i: string) => {
    if (isEdit.status) {
      setIsEdit({ status: false, id: "" });
    }

    const newList = sizeList.filter(({ id }) => i !== id);
    setSizeList(newList);
  };

  // adding the selected size to the list is handled here
  const handleSizeList = () => {
    // so when the edit is true, and they pressed on the edit button that time changing the edit status to false
    if (isEdit.status) {
      setIsEdit({ status: false, id: "" });
      setSize(0);
    } else {
      const list = [...sizeList];
      const listContainer = containerRef.current;

      // saving both the size and the id for editing purposes
      list.push({ size, id: uuidv4() });
      setSizeList(list);

      // Scrolls to the size when it's added or removed
      setTimeout(() => {
        if (listContainer) {
          listContainer?.scrollTo({
            top: listContainer?.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 10);
    }
  };

  // handling the slider changes
  const handleSizeChange = (e: number) => {
    // if the edit status is true, then updating the particular size
    if (isEdit.status) {
      const list = [...sizeList].map(({ id, size: defaultSize }) => {
        if (isEdit.id === id) {
          return { id, size: e };
        }
        return { id, size: defaultSize };
      });
      setSizeList(list);
    } else {
      // else updating the size state
      setSize(e);
    }
  };

  const handleQuarterChange = (value: number) => {
    if (isEdit.status) {
      const list = [...sizeList].map(({ id, size: defaultSize }) => {
        if (isEdit.id === id) {
          return { id, size: defaultSize + value };
        }
        return { id, size: defaultSize };
      });

      setSizeList(list);
    } else {
      setSize((current) => current + value);
    }
  };

  // this is called when holding the size
  const onHoldStart = (id: string) => {
    setOnHold({ status: true, id });
  };

  // this is called when not holding the size
  const onHoldEnd = () => {
    setOnHold({ status: false, id: "" });
  };

  return (
    <Drawer
      onClose={() => {
        setSize(0);
        onDrawerClose();
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="sm:max-w-2xl sm:mx-auto">
        <div className="m-5 space-y-4">
          <div>
            <Label>{name}</Label>
            <div
              className="w-full h-40 overflow-y-scroll px-3 py-4 border border-input rounded-sm mt-2 mb-16 flex flex-wrap gap-x-3 gap-y-4 justify-start"
              ref={containerRef}
            >
              <AnimatePresence>
                {sizeList.map((details) => {
                  const { size, id } = details;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: "20px", scale: 0.75 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      key={id}
                      // added all this for edit the specific size
                      onMouseDown={() => onHoldStart(id)}
                      onTouchStart={() => onHoldStart(id)}
                      onMouseLeave={onHoldEnd}
                      onMouseUp={onHoldEnd}
                      onMouseOut={onHoldEnd}
                      onTouchCancel={onHoldEnd}
                      onTouchEnd={onHoldEnd}
                      className={`flex items-center justify-center h-16 w-16 transition-colors border ${
                        isEdit.status && isEdit.id === id
                          ? "border-primary"
                          : "border-input"
                      } rounded-sm relative`}
                    >
                      {Math.floor(size)}
                      <sup className="pl-1">
                        {formatSize(size - Math.floor(size))}
                      </sup>

                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute w-5 h-5 -top-2 -right-2"
                        onClick={() => {
                          removeSize(id);
                          play();
                        }}
                      >
                        <XMarkIcon height={12} width={12} />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Badge variant="secondary" className="py-1 w-20 justify-center">
              {Math.floor(activeSize)}
              <sup className="pl-1">
                {formatSize(activeSize - Math.floor(activeSize))}
              </sup>
            </Badge>

            <Slider
              value={[activeSize]}
              max={120}
              step={1}
              onValueChange={([e]) => handleSizeChange(e)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 h-20">
            {sizeOptions.map(({ value, name }) => {
              return (
                <Button
                  key={value}
                  variant="outline"
                  className="h-full text-base"
                  onClick={() => handleQuarterChange(value)}
                >
                  {name}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setSize(0)}
              disabled={size === 0 || isEdit.status}
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                handleSizeList();
                playAddListSound();
              }}
              disabled={size === 0 && !isEdit.status}
            >
              {isEdit.status ? "Edit" : "Add"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SizeDrawer;
