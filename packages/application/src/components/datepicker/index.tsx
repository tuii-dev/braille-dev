"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";

interface DatePickerWithRangeProps {
  numberOfMonths: number;
  componentClassName?: string;
  buttonClassName?: string;
  onChange: (date: DateRange | undefined) => void;
  from: string | undefined;
  to: string | undefined;
}

export function DatePickerWithRange({
  numberOfMonths,
  componentClassName,
  buttonClassName,
  onChange,
  from,
  to,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  React.useEffect(() => {
    setDate({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }, [from, to]);

  const handleDateChange = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    onChange(selectedDate);
  };

  return (
    <div className={cn("grid gap-2", componentClassName)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="minimal"
            className={cn(
              "justify-start text-left font-normal",
              buttonClassName,
              !date && "text-muted-foreground",
            )}
          >
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/LLL/yyyy")}-{""}
                  {format(date.to, "dd/LLL/yyyy")}
                </>
              ) : (
                format(date.from, "dd/LLL/yyyy")
              )
            ) : (
              <>
                <CalendarIcon className="mr-2 h-3 w-3" />
                <span>Pick a date</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
