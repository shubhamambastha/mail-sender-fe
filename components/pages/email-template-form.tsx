"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinusCircle, PlusCircle } from "lucide-react";
interface Template {
  id: string;
  name: string;
}

interface CompanyEntry {
  email: string;
  recruiterName: string;
  companyName: string;
  jobDesignation: string;
}

export default function EmailTemplateForm() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [entries, setEntries] = useState<CompanyEntry[]>([
    { email: "", recruiterName: "", companyName: "", jobDesignation: "" },
  ]);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addEntry = () => {
    setEntries([
      ...entries,
      { email: "", recruiterName: "", companyName: "", jobDesignation: "" },
    ]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (
    index: number,
    field: keyof CompanyEntry,
    value: string
  ) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch("/api/templates");
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load templates"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/email", {
      method: "POST",
      body: JSON.stringify({
        templateId: selectedTemplate,
        entries,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    const data = await response.json();

    console.log("Email sent successfully", data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Template Form</CardTitle>
        <CardDescription>
          Select a template and add multiple company entries.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Select Template</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger id="template">
                <SelectValue
                  placeholder={
                    isLoading ? "Loading templates..." : "Choose a template"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {error ? (
                  <SelectItem value="error" disabled>
                    Error loading templates
                  </SelectItem>
                ) : (
                  templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {entries.map((entry, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Entry {index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(index)}
                    >
                      <MinusCircle className="h-4 w-4" />
                      <span className="sr-only">Remove entry</span>
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`}>
                    Company/Recruiter Email
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="company@email.com"
                    value={entry.email}
                    onChange={(e) =>
                      updateEntry(index, "email", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`recruiterName-${index}`}>
                    Recruiter Name
                  </Label>
                  <Input
                    id={`recruiterName-${index}`}
                    type="text"
                    placeholder="John Doe"
                    value={entry.recruiterName}
                    onChange={(e) =>
                      updateEntry(index, "recruiterName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`companyName-${index}`}>Company Name</Label>
                  <Input
                    id={`companyName-${index}`}
                    placeholder="Acme Inc."
                    value={entry.companyName}
                    onChange={(e) =>
                      updateEntry(index, "companyName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`jobDesignation-${index}`}>
                    Job Designation
                  </Label>
                  <Input
                    id={`jobDesignation-${index}`}
                    placeholder="Job Designation..."
                    value={entry.jobDesignation}
                    onChange={(e) =>
                      updateEntry(index, "jobDesignation", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addEntry}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Another Entry
          </Button>
        </CardContent>
        <CardFooter className="mt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            Send Email
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
