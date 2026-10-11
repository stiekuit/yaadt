import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerNumber: string;
  deviceSerials: string[];
}

interface MobileCustomerInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  onSave: () => void;
}

export const MobileCustomerInfoSheet = ({
  open,
  onOpenChange,
  customerInfo,
  onCustomerInfoChange,
  onSave,
}: MobileCustomerInfoSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 pt-8 pb-6 border-b">
            <SheetTitle className="text-2xl font-bold">
              Customer Information
            </SheetTitle>
            <SheetDescription>
              Update the customer details for this support conversation
            </SheetDescription>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-5">
              {/* Contact Details Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Contact Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-sm mb-1.5 block">
                      Full Name
                    </Label>
                    <Input
                      id="edit-name"
                      placeholder="John Doe"
                      value={customerInfo.customerName}
                      onChange={(e) =>
                        onCustomerInfoChange({ ...customerInfo, customerName: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-email" className="text-sm mb-1.5 block">
                      Email Address
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="john@example.com"
                      value={customerInfo.customerEmail}
                      onChange={(e) =>
                        onCustomerInfoChange({ ...customerInfo, customerEmail: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-phone" className="text-sm mb-1.5 block">
                      Phone Number
                    </Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={customerInfo.customerNumber}
                      onChange={(e) =>
                        onCustomerInfoChange({ ...customerInfo, customerNumber: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Device Information Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Device Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-serials" className="text-sm mb-1.5 block">
                      Device Serial Numbers
                    </Label>
                    <Input
                      id="edit-serials"
                      placeholder="Enter serial numbers (comma-separated)"
                      value={customerInfo.deviceSerials.join(', ')}
                      onChange={(e) =>
                        onCustomerInfoChange({
                          ...customerInfo,
                          deviceSerials: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 border-t bg-background pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold"
              onClick={onSave}
            >
              Save Information
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
