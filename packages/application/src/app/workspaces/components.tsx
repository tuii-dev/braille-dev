"use client";

import {
  Template,
  templates,
  categories,
  currentTenantId,
} from "@/app/workspaces/templates";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { useWorkspaceContext } from "@/app/_helpers/workspace-settings-context";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from "@/components/dialog";
import { createWorkspace } from "@/lib/actions/create-workspace";
import { Button } from "@/components/button";
import { tenants } from "@/app/workspaces/templates";
import { TextInput } from "@/components/textinput";
import { workspaceThemeTextColor } from "@/lib/color";

export const SpaceSettingsLink = () => {
  const params = useParams<{ id: string }>();
  const { color } = useWorkspaceContext(params.id);

  if (!params.id) {
    return null;
  }

  return (
    <Button
      style={{ backgroundColor: color, color: workspaceThemeTextColor(color) }}
      className="group"
      variant="primary"
      aria-label="Workspace Settings"
      href={`/workspaces/${params.id}/settings/workspace-settings`}
      as="link"
      shape="square"
      icon={
        <Cog6ToothIcon className="w-5 h-5 transition-transform ease-in-out duration-1000 group-hover:rotate-[-360deg]" />
      }
    />
  );
};

interface CreateWorkspaceDialogButtonProps {
  buttonVariant?: "primary" | "danger" | "secondary" | "minimal" | "none";
  buttonClassName?: string;
}

export const CreateWorkspaceDialogButton: React.FC<
  CreateWorkspaceDialogButtonProps & {
    children: (setIsDialogOpen: (open: boolean) => void) => React.ReactNode;
  }
> = ({ children }) => {
  const [step, setStep] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>(
    {},
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const resetStateVariables = () => {
    setStep(1);
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedTemplate(null);
    setWorkspaceName("");
    setSettingsValues({});
  };

  const handleExtraButtonClick = (id: string) => {
    setSelectedTemplate(null);
    setStep(2);
  };

  const extraButtons = [{ label: "Start from Scratch", id: "start-scratch" }];

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory =
        selectedCategory === "All" ||
        template.categories.includes(selectedCategory);
      const matchesSearch = template.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const isCurrentTenant = template.tenantId === currentTenantId;
      const isPublicTemplate = template.publicTemplate === true;
      return (
        matchesCategory &&
        matchesSearch &&
        (isCurrentTenant || isPublicTemplate)
      );
    });
  }, [searchTerm, selectedCategory]);

  const selectedTemplateObj = useMemo(() => {
    return templates.find((template) => template.id === selectedTemplate);
  }, [selectedTemplate]);

  const areSettingsValid = () => {
    if (selectedTemplateObj && selectedTemplateObj.settings) {
      return selectedTemplateObj.settings.every(
        (setting) =>
          settingsValues[setting.title] &&
          settingsValues[setting.title].trim() !== "",
      );
    }
    return true;
  };

  const confirmWorkspaceSettings = async () => {
    const formData = new FormData();
    formData.append("name", workspaceName);

    if (selectedTemplateObj) {
      formData.append("workspaceTemplate", JSON.stringify(selectedTemplateObj));
    }

    // if (aiPrompt) {
    //   formData.append("aiPrompt", aiPrompt);
    // }
    const result = await createWorkspace(formData);

    if (result && result.errors) {
      // Display errors in the UI
      throw new Error(JSON.stringify(result.errors));
    }

    if (result && result.success) {
      router.push(result.workspaceUrl); // Navigate using App Router's useRouter
    }

    setIsDialogOpen(false);
    resetStateVariables();
  };

  const onOpenChange = async (open: boolean) => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
    } else {
      resetStateVariables();
    }
  };

  const handleNextClick = () => {
    if (step === 1 && selectedTemplate) {
      setStep(2);
    } else if (step === 2 && workspaceName.trim() !== "") {
      if (selectedTemplateObj?.settings?.length) {
        setStep(3);
      } else {
        setStep(4);
      }
    } else if (step === 3 && areSettingsValid()) {
      setStep(4);
    } else {
    }
  };

  const handleBackClick = () => {
    if (step === 2) {
      setStep(1);
      setWorkspaceName("");
    } else if (step === 3) {
      setStep(2);
      setSettingsValues({});
    } else if (step === 4) {
      if (selectedTemplateObj?.settings?.length) {
        setStep(3);
      } else {
        setStep(2);
      }
    }
  };

  const isNextButtonDisabled =
    (step === 1 && !selectedTemplate) ||
    (step === 2 && workspaceName.trim() === "") ||
    (step === 3 &&
      selectedTemplateObj &&
      selectedTemplateObj.settings &&
      selectedTemplateObj.settings.length > 0 &&
      !areSettingsValid());

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children(setIsDialogOpen)}</DialogTrigger>
      <DialogOverlay />
      <DialogContent className="w-full max-w-6xl text-left">
        <DialogHeader>
          {step === 1 && (
            <div>
              <DialogTitle>Select a Template</DialogTitle>
              <DialogDescription className="mt-4 mb-4">
                Choose a template to get started with your workspace.
              </DialogDescription>
              <div className="flex-col">
                <div className="flex">
                  <div className="w-1/4 pr-4 border-r overflow-y-auto flex flex-col justify-between">
                    <div>
                      <h3 className="mt-4 mb-2 text-lg font-semibold dark:text-white">
                        Categories
                      </h3>
                      <CategoryList
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        setSelectedTemplate={setSelectedTemplate}
                      />
                    </div>
                    <ExtraButtons
                      buttons={extraButtons}
                      onButtonClick={handleExtraButtonClick}
                    />
                  </div>
                  <div className="w-3/4 pl-4 flex flex-col min-h-[600px]">
                    <div className="m-4">
                      <TextInput
                        name="search"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                      />
                    </div>
                    <div className="overflow-y-auto w-full h-full max-h-[600px]">
                      <TemplateGrid
                        templates={filteredTemplates}
                        onSelectTemplate={setSelectedTemplate}
                        selectedTemplate={selectedTemplate}
                        currentTenantId={currentTenantId}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleNextClick}
                    disabled={isNextButtonDisabled}
                    className={`${
                      isNextButtonDisabled
                        ? "dark:opacity-20 opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="h-full flex flex-col">
              <DialogTitle>Customize Your Workspace</DialogTitle>
              <DialogDescription className="mt-4 mb-4">
                Give your workspace a name. You can change it later.
              </DialogDescription>
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col gap-2 flex-1">
                  <TextInput
                    placeholder="Workspace Name"
                    name="workspace name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.currentTarget.value)}
                    required
                  />
                </div>
                <footer className="mt-2 w-full flex justify-between">
                  <Button type="button" onClick={handleBackClick}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextClick}
                    disabled={isNextButtonDisabled}
                    className={`${
                      isNextButtonDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Next
                  </Button>
                </footer>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="h-full flex flex-col">
              <DialogTitle>Workspace Context</DialogTitle>
              <DialogDescription className="mt-4 mb-4">
                Give extra context to your workspace. This helps Braille make
                better decisions, especially in regards to qualitative analysis.
              </DialogDescription>
              <div className="flex-1 flex flex-col">
                {selectedTemplateObj?.settings?.length ? (
                  selectedTemplateObj.settings.map((setting, index) => (
                    <div key={index} className="mb-4">
                      <label
                        htmlFor={setting.title}
                        className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200"
                      >
                        {setting.title}
                      </label>
                      <TextInput
                        name="title"
                        id={setting.title}
                        placeholder={setting.placeholder}
                        value={settingsValues[setting.title] || ""}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setSettingsValues((prev) => ({
                            ...prev,
                            [setting.title]: value,
                          }));
                        }}
                      />
                      {setting.description && (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {setting.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No settings to adjust.</p>
                )}
                <footer className="mt-2 w-full flex justify-between">
                  <Button type="button" onClick={handleBackClick}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextClick}
                    disabled={isNextButtonDisabled}
                    className={`${
                      isNextButtonDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Next
                  </Button>
                </footer>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <DialogTitle>Workspace Confirmation</DialogTitle>
              <DialogDescription className="mt-4 mb-4">
                Your workspace &quot;{workspaceName}&quot; will be created using
                the template:{" "}
                <b>&quot;{selectedTemplateObj?.name ?? "Unknown"} &quot;.</b>
              </DialogDescription>
              <footer className="mt-2 w-full flex justify-between">
                <Button type="button" onClick={handleBackClick}>
                  Back
                </Button>
                <Button type="button" onClick={confirmWorkspaceSettings}>
                  Go to Workspace
                </Button>
              </footer>
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const TemplateGrid = ({
  templates,
  onSelectTemplate,
  selectedTemplate,
  currentTenantId,
}: {
  templates: Template[];
  onSelectTemplate: (templateId: string) => void;
  selectedTemplate: string | null;
  currentTenantId: string;
}) => {
  if (templates.length === 0) {
    return (
      <p className="text-gray-800 dark:text-gray-200">No templates found.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 m-2 content-start">
      {templates.map((template) => {
        const isFromMyOrganization = template.tenantId === currentTenantId;
        const usesPremiumApps =
          template.apps?.some((app) => app.isPremium) ?? false;
        const tenant = tenants.find((t) => t.id === template.tenantId);

        return (
          <button
            aria-pressed={selectedTemplate === template.name}
            key={template.id}
            className={`border p-4 rounded cursor-pointer hover:shadow 
              ${
                selectedTemplate === template.id
                  ? "ring-2 ring-indigo-500 dark:ring-indigo-300 border-white"
                  : ""
              } 
              ${
                usesPremiumApps && selectedTemplate !== template.id
                  ? "border-amber-500 dark:border-amber-300"
                  : ""
              } 
              ${
                usesPremiumApps && selectedTemplate === template.id
                  ? "border-white"
                  : ""
              }
              flex flex-col w-[240px] h-72`}
            onClick={() => onSelectTemplate(template.id)}
          >
            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <h4 className="text-md font-semibold dark:text-white">
                {template.name}
              </h4>

              {/* Display categories as badges */}
              <div className="flex flex-wrap mt-2">
                {template.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2.5 py-0.5 mr-1 mb-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Description with dynamic truncation */}
              {template.description && (
                <p className="text-sm text-gray-700 mt-2 dark:text-gray-300 line-clamp-5">
                  {template.description}
                </p>
              )}
            </div>

            {/* Additional information */}
            <div className="pt-2">
              {isFromMyOrganization && (
                <div className="mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-300 dark:text-green-900">
                    Your Organization
                  </span>
                </div>
              )}
              {usesPremiumApps && (
                <div className="mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-300 dark:text-amber-900">
                    Requires Premium Apps
                  </span>
                </div>
              )}
              {template.tenantPublisher && tenant && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Created by: {tenant.name}
                </p>
              )}
              {!template.tenantPublisher && tenant && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Created by: {template.createdBy.name}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

type CategoryListProps = {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string | null>>;
};

// CategoryList Component
const CategoryList = ({
  selectedCategory,
  setSelectedCategory,
  setSelectedTemplate,
}: CategoryListProps) => {
  return (
    <ul className="ml-2">
      {categories.map((category) => (
        <li key={category} className="mb-1">
          <button
            className={`${
              selectedCategory === category
                ? "font-bold text-indigo-600"
                : "text-gray-800 dark:text-gray-200 hover:text-indigo-600"
            }`}
            onClick={() => {
              setSelectedCategory(category);
              setSelectedTemplate(null);
            }}
          >
            {category}
          </button>
        </li>
      ))}
    </ul>
  );
};

const ExtraButtons = ({
  buttons,
  onButtonClick,
}: {
  buttons: { label: string; id: string }[];
  onButtonClick: (id: string) => void;
}) => {
  return (
    <ul className="mt-4">
      {buttons.map((button) => (
        <li key={button.id}>
          <button
            onClick={() => onButtonClick(button.id)}
            className="text-gray-800 dark:text-gray-200 hover:text-indigo-600 font-semibold px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {button.label}
          </button>
        </li>
      ))}
    </ul>
  );
};
