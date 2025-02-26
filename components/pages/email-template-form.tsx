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
import { toast } from "sonner";

interface TemplateApiResponse {
  id: number | string;
  name: string;
  html: string;
  variables: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Template {
  id: string;
  name: string;
  html: string;
  variables: string[];
}

interface CompanyEntry {
  email: string;
  [key: string]: string; // Allow dynamic fields based on template variables
}

export default function EmailTemplateForm() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedTemplateData, setSelectedTemplateData] =
    useState<Template | null>(null);
  const [entries, setEntries] = useState<CompanyEntry[]>([{ email: "" }]);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a default entry with all required fields based on template variables
  const createDefaultEntry = (templateVars: string[] = []) => {
    const entry: CompanyEntry = { email: "" };
    templateVars.forEach((variable) => {
      entry[variable] = "";
    });
    return entry;
  };

  const addEntry = () => {
    const defaultEntry = selectedTemplateData
      ? createDefaultEntry(selectedTemplateData.variables)
      : { email: "" };

    setEntries([...entries, defaultEntry]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: string) => {
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
        console.log("Templates API response:", data);

        // Ensure the templates have the correct structure
        const processedTemplates = data.map(
          (template: TemplateApiResponse) => ({
            id: template.id.toString(),
            name: template.name,
            html: template.html,
            variables: template.variables || [],
          })
        );

        console.log("Processed templates:", processedTemplates);
        setTemplates(processedTemplates);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load templates"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Update entries when template changes
  useEffect(() => {
    if (!selectedTemplate || !templates.length) return;

    console.log("Selected template ID:", selectedTemplate);
    console.log("Available templates:", templates);

    const template = templates.find(
      (t) => t.id.toString() === selectedTemplate
    );
    console.log("Found template:", template);

    if (template) {
      setSelectedTemplateData(template);

      // Update all entries with the new template variables
      const updatedEntries = entries.map((entry) => {
        const newEntry: CompanyEntry = { email: entry.email };
        template.variables.forEach((variable) => {
          newEntry[variable] = entry[variable] || "";
        });
        return newEntry;
      });

      setEntries(updatedEntries);
    }
  }, [selectedTemplate, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplateData) {
      toast.error("Please select a template");
      return;
    }

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          entries,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Email sent successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send email"
      );
    }
  };

  // Get a friendly display name for a variable
  const getVariableDisplayName = (variable: string) => {
    return variable
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
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
              onValueChange={(value) => {
                console.log("Template selected:", value);
                setSelectedTemplate(value);
              }}
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
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplateData && (
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Template Preview</h3>
              <div className="text-sm mb-2">
                <strong>Template ID:</strong> {selectedTemplateData.id}
              </div>
              <div className="text-sm mb-2">
                <strong>Template Name:</strong> {selectedTemplateData.name}
              </div>
              <div className="text-sm mb-2">
                <strong>Variables:</strong>{" "}
                {selectedTemplateData.variables.join(", ")}
              </div>
              <div className="mt-4 p-3 bg-card border rounded-md">
                <h4 className="text-sm font-medium mb-2">HTML Preview:</h4>
                <div
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: selectedTemplateData.html,
                  }}
                />
              </div>
            </div>
          )}

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

                {selectedTemplateData?.variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label htmlFor={`${variable}-${index}`}>
                      {getVariableDisplayName(variable)}
                    </Label>
                    <Input
                      id={`${variable}-${index}`}
                      placeholder={`Enter ${getVariableDisplayName(
                        variable
                      ).toLowerCase()}...`}
                      value={entry[variable] || ""}
                      onChange={(e) =>
                        updateEntry(index, variable, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
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
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedTemplate}
          >
            Send Email
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
