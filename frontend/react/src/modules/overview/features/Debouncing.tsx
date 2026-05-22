/* eslint-disable @typescript-eslint/no-explicit-any */
// Debouncing is when we wait until the user stops doing something for a short time before running the action.
// mostly used for: search inputs, resize events, autosave, and filtering.

import { Search01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useEffect, useRef, useState } from "react";

type userData = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

function DebouncingEx() {
  const [dumpData, setData] = useState<userData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    const getData = async () => {
      const data = await fetch("https://dummyjson.com/users");
      const json = await data.json();
      console.log(json.users);
      setData(json.users);
    };
    getData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const filteredUsers = dumpData.filter((user) => {
    return `${user.firstName} ${user.lastName} ${user.age}`
      .trim()
      .toLowerCase()
      .includes(debouncedValue.toLowerCase().trim());
  });
  return (
    <div className="mx-auto my-8 w-7xl border-2 p-8">
      <div className="mb-6 flex items-center gap-4 p-2">
        <HugeiconsIcon icon={Search01Icon} />
        <input
          placeholder="enter user name"
          className="rounded-md p-1 outline"
          value={searchValue}
          onChange={handleSearch}
          ref={inputRef}
        ></input>
      </div>
      {filteredUsers.map((user) => {
        return (
          <div key={user.id} className="mx-8 my-4 flex gap-2">
            <HugeiconsIcon icon={UserIcon} />
            <span>{user.firstName}</span>
            <span>{user.lastName}</span>
            <span>{user.age}</span>
          </div>
        );
      })}
    </div>
  );
}

export default DebouncingEx;
