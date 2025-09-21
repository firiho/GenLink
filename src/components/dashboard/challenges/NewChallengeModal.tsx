import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChallengeModal = ({ isOpen, onClose }: NewChallengeModalProps) => {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your challenge creation logic here
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Create New Challenge</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Launch a new innovation challenge for your community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                Challenge Title
              </label>
              <Input
                placeholder="Enter challenge title"
                className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                Description
              </label>
              <Textarea
                placeholder="Describe your challenge"
                className="w-full min-h-[100px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700",
                        !startDate && "text-slate-500 dark:text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="bg-white dark:bg-slate-900"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700",
                        !endDate && "text-slate-500 dark:text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="bg-white dark:bg-slate-900"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                Prize Pool
              </label>
              <Input
                type="text"
                placeholder="Enter prize amount"
                className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              Create Challenge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewChallengeModal; 