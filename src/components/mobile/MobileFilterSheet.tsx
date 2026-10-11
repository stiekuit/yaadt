import { X } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileFilterSheet = ({ open, onOpenChange }: MobileFilterSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Filter Tickets</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter Options */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status Filters */}
          <div className="space-y-3">
            <Label className="font-semibold">Status</Label>
            <div className="space-y-2">
              {['Open', 'Pending', 'Resolved', 'Closed'].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox id={`status-${status}`} />
                  <label
                    htmlFor={`status-${status}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filters */}
          <div className="space-y-3">
            <Label className="font-semibold">Priority</Label>
            <div className="space-y-2">
              {['Urgent', 'High', 'Medium', 'Low'].map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox id={`priority-${priority}`} />
                  <label
                    htmlFor={`priority-${priority}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {priority}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-border bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12">
              Clear All
            </Button>
            <Button className="h-12" onClick={() => onOpenChange(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
