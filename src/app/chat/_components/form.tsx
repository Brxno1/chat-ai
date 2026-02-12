import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronsUpDown,
  Files,
  Ghost,
  Paperclip,
  SendIcon,
  StopCircle,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TypingText } from "@/components/animate-ui/text/typing";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AIForm,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/components/ui/kibo-ui/ai/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useChatInstance } from "@/context/chat";
import { useMultipleUploads } from "@/hooks/use-multiple-uploads";
import { useChatStore } from "@/store/chat";
import { cn } from "@/utils/utils";

import { models } from "../models/definitions";
import { ModelTierIcon } from "../models/model-tier-icon";
import { ImagePreview } from "./image-preview";
import { RecorderAudio } from "./recorder-audio";

const schema = z.object({
  message: z.string().optional(),
  files: z
    .array(
      z.instanceof(File, {
        message: "Por favor, selecione um arquivo válido",
      }),
    )
    .refine(
      (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
      `${Files.length > 1 ? "Os arquivos devem ter no máximo 10MB cada" : "O arquivo deve ter no máximo 10MB"}`,
    )
    .optional()
    .nullable(),
  audio: z
    .instanceof(File, {
      message: "Por favor, selecione um arquivo válido",
    })
    .optional()
    .nullable(),
});

export function ChatForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      message: "",
      files: null,
      audio: null,
    },
  });

  const {
    files,
    images,
    fileInputRef,
    handleThumbnailClick,
    validateAndProcessFileInput,
    handleRemoveAll,
    handleRemoveItem,
  } = useMultipleUploads();

  const {
    input,
    status,
    model,
    onSubmitChat,
    onModelChange,
    onInputChange,
    onStop,
    buttonSubmitRef,
    inputRef,
  } = useChatInstance();

  const isGhostChatMode = useChatStore((state) => state.isGhostChatMode);

  const onRemoveItem = (index: number) => {
    handleRemoveItem(index);

    if (files.length <= 1) {
      form.setValue("files", null);
    }

    const remainingFiles = [...files];
    remainingFiles.splice(index, 1);
    form.setValue("files", remainingFiles);
  };

  const handleSubmit = ({ files, audio }: z.infer<typeof schema>) => {
    const allFiles: File[] = [];

    if (files && files.length > 0) {
      allFiles.push(...files);
      handleRemoveAll();
    }

    if (audio && audio.size > 0) {
      allFiles.push(audio);
    }

    onSubmitChat(undefined, {
      files: allFiles.length > 0 ? allFiles : undefined,
    });

    form.reset();
  };

  const onSetAudio = (audio: File) => {
    form.setValue("audio", audio);
  };

  React.useEffect(() => {
    if (files.length > 0) {
      form.setValue("files", files);
    }
  }, [files, form]);

  return (
    <Form {...form}>
      <AIForm
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          "!m-0 items-center overflow-y-auto rounded-md border border-input bg-sidebar px-2",
          isGhostChatMode && "border-dashed",
        )}
      >
        {images.length > 0 && (
          <ImagePreview
            className="size-14"
            images={images}
            onRemoveItem={onRemoveItem}
          />
        )}
        <AIInputToolbar>
          <AIInputTools className="mr-1 w-full flex-1 items-center">
            <div className="flex shrink-0 items-center">
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AIInputButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleThumbnailClick}
                      >
                        <Paperclip className="size-4 text-muted-foreground" />
                        <Input
                          type="file"
                          ref={fileInputRef}
                          onChange={(ev) => {
                            validateAndProcessFileInput(ev);
                            field.onChange(ev.target.files);
                          }}
                          className="absolute inset-0 z-10 hidden"
                          accept="image/*"
                          multiple
                          aria-label="Carregar arquivo de imagem"
                        />
                      </AIInputButton>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="relative flex flex-1 items-center">
                  <FormControl>
                    <AIInputTextarea
                      name="message"
                      ref={inputRef}
                      autoFocus={status === "ready"}
                      disabled={status === "streaming"}
                      value={input}
                      onChange={(ev) => {
                        field.onChange(ev);
                        onInputChange(ev);
                      }}
                    />
                  </FormControl>
                  {!input && (
                    <TypingText
                      loop
                      text="O que você quer saber?"
                      className="pointer-events-none absolute left-1 top-[1.4375rem] -translate-y-1/2 text-sm text-muted-foreground sm:top-[1.25rem]"
                    />
                  )}
                </FormItem>
              )}
            />
            <AIInputModelSelect
              value={model.name}
              onValueChange={onModelChange}
            >
              <AIInputModelSelectTrigger
                className="w-auto shrink-0 border-none text-sm text-muted-foreground transition-all [&>span]:hidden sm:[&>span]:inline-flex [&>svg]:inline-flex sm:[&>svg]:hidden"
                disabled={status === "streaming"}
              >
                <span className="flex items-center gap-1">
                  <Image
                    src={`https://img.logo.dev/${model.provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
                    alt={model.provider}
                    className="mr-2 inline-flex size-4 rounded-sm"
                    width={16}
                    height={16}
                  />
                  {model.name}
                  <ChevronsUpDown className="size-4 text-muted-foreground" />
                </span>
                <ModelTierIcon
                  tier={model.tier}
                  className="size-4 text-muted-foreground"
                />
              </AIInputModelSelectTrigger>
              <AIInputModelSelectContent className="bg-card">
                {models.map((m) => (
                  <AIInputModelSelectItem
                    value={m.name}
                    key={m.id}
                    data-active={m.name === model.name}
                    className="flex cursor-pointer flex-row items-center text-sm data-[active=true]:cursor-default data-[active=true]:bg-primary/10"
                    disabled={m.disabled}
                  >
                    <Image
                      src={`https://img.logo.dev/${m.provider}?token=${process.env.NEXT_PUBLIC_LOGO_TOKEN}`}
                      alt={m.provider}
                      className="mr-2 inline-flex size-4 rounded-sm"
                      width={16}
                      height={16}
                    />
                    <span
                      className={cn(
                        m.premium &&
                          "bg-gradient-to-r from-[#fc1789] via-[#751dce] to-[#5bccfc] bg-clip-text font-bold text-transparent",
                      )}
                    >
                      {m.name}
                    </span>
                  </AIInputModelSelectItem>
                ))}
                <Separator orientation="horizontal" />
                <TemporaryChatSwitch />
              </AIInputModelSelectContent>
            </AIInputModelSelect>
          </AIInputTools>
          {status === "streaming" ? (
            <Button
              onClick={onStop}
              type="button"
              variant="default"
              className="text-md min-w-[3rem] rounded-md font-bold"
              size="icon"
            >
              <StopCircle size={16} />
            </Button>
          ) : input ? (
            <Button
              ref={buttonSubmitRef}
              disabled={form.formState.isSubmitting}
              type="submit"
              size="icon"
              className="text-md min-w-[3rem] rounded-md font-bold"
            >
              <SendIcon size={16} />
            </Button>
          ) : (
            <RecorderAudio
              onSetAudio={onSetAudio}
              isSubmitting={form.formState.isSubmitting}
            />
          )}
        </AIInputToolbar>
      </AIForm>
    </Form>
  );
}

function TemporaryChatSwitch() {
  const defineChatToGhostMode = useChatStore(
    (state) => state.defineChatToGhostMode,
  );
  const isGhostChatMode = useChatStore((state) => state.isGhostChatMode);

  return (
    <div className="flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors hover:bg-accent">
      <label htmlFor="ghost-mode-switch" className="flex items-center gap-2">
        <Ghost size={16} className="text-muted-foreground" />
        Conversa temporária
      </label>
      <Switch
        id="ghost-mode-switch"
        checked={isGhostChatMode}
        onCheckedChange={() => defineChatToGhostMode((prev) => !prev)}
        aria-label="Conversa temporária"
      />
    </div>
  );
}
