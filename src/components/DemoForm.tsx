"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListChecks } from 'lucide-react';
import type { SpreadsheetRowObject } from '@/types';

interface DemoFormProps {
  formData: SpreadsheetRowObject | null;
  setFormData: Dispatch<SetStateAction<SpreadsheetRowObject | null>>;
}

interface FormFields {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const initialFormFields: FormFields = { name: '', email: '', phone: '', address: '' };

export function DemoForm({ formData, setFormData }: DemoFormProps) {

  const formValues: FormFields = {
    name: String(formData?.['Name'] || formData?.['name'] || initialFormFields.name),
    email: String(formData?.['Email'] || formData?.['email'] || initialFormFields.email),
    phone: String(formData?.['Phone'] || formData?.['phone'] || formData?.['Number'] || formData?.['number'] || initialFormFields.phone),
    address: String(formData?.['Address'] || formData?.['address'] || initialFormFields.address),
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // This component doesn't manage form state directly, it just displays.
    // For a real form, you'd update a local state here.
    // For now, we'll just log it or if we want to enable editing, we would update `formData` prop which is complex.
    // This is just for display and auto-fill demo.
    console.log(`Field ${name} changed to ${value}`);
  };

  const clearForm = () => {
    setFormData(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ListChecks className="h-6 w-6 text-primary" />
          Demo Form
        </CardTitle>
        <CardDescription>This form will be auto-filled when you select a row from the spreadsheet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formValues.name} onChange={handleInputChange} placeholder="Enter name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formValues.email} onChange={handleInputChange} placeholder="Enter email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" value={formValues.phone} onChange={handleInputChange} placeholder="Enter phone number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={formValues.address} onChange={handleInputChange} placeholder="Enter address" />
        </div>
        <Button onClick={clearForm} variant="outline" className="w-full">
          Clear Form
        </Button>
      </CardContent>
    </Card>
  );
}
