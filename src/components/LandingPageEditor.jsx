import { useState, useEffect, useRef } from 'react';

import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import { Label } from '@/components/ui/label';

import { Switch } from '@/components/ui/switch';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import { toast } from 'sonner';

import {
  Save,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  Upload,
  ImageIcon,
  X
} from 'lucide-react';

import ImageCropDialog from '@/components/ImageCropDialog';

async function uploadImage(file, path) {
  const ext =
    file.name
      .split('.')
      .pop();

  const filePath =
    `${path}-${Date.now()}.${ext}`;

  const { error } =
    await supabase.storage
      .from(
        'landing-assets'
      )
      .upload(
        filePath,
        file,
        {
          upsert: true
        }
      );

  if (error) {
    toast.error(
      'Upload failed: ' +
        error.message
    );

    return null;
  }

  const { data } =
    supabase.storage
      .from(
        'landing-assets'
      )
      .getPublicUrl(
        filePath
      );

  return data.publicUrl;
}

function ImageUploadField({
  label,
  value,
  onChange,
  aspectRatio
}) {
  const inputRef =
    useRef(null);

  const [
    uploading,
    setUploading
  ] = useState(false);

  const [cropSrc, setCropSrc] =
    useState(null);

  const handleFile = (
    file
  ) => {
    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      toast.error(
        'Please select an image file'
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        'Image must be under 5MB'
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () =>
      setCropSrc(
        reader.result
      );

    reader.readAsDataURL(
      file
    );
  };

  const handleCropped =
    async (blob) => {
      setCropSrc(null);

      setUploading(true);

      const file =
        new File(
          [blob],
          'cropped.jpg',
          {
            type:
              'image/jpeg'
          }
        );

      const url =
        await uploadImage(
          file,
          label
            .toLowerCase()
            .replace(
              /\s+/g,
              '-'
            )
        );

      if (url)
        onChange(url);

      setUploading(
        false
      );
    };

  return (
    <div>
      <Label>
        {label}
      </Label>

      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt={label}
              className="h-20 w-20 rounded-lg object-cover border border-border"
            />

            <button
              onClick={() =>
                onChange('')
              }
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}

        <div>
          <Button
            variant="outline"
            size="sm"
            disabled={
              uploading
            }
            onClick={() =>
              inputRef.current?.click()
            }
          >
            <Upload className="h-4 w-4 mr-1" />

            {uploading
              ? 'Uploading...'
              : 'Upload Image'}
          </Button>

          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG,
            WEBP • Max
            5MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(
            e
          ) => {
            if (
              e.target
                .files?.[0]
            ) {
              handleFile(
                e
                  .target
                  .files[0]
              );
            }

            e.target.value =
              '';
          }}
        />
      </div>

      {cropSrc && (
        <ImageCropDialog
          open={!!cropSrc}
          imageSrc={
            cropSrc
          }
          aspectRatio={
            aspectRatio
          }
          onClose={() =>
            setCropSrc(
              null
            )
          }
          onCropComplete={
            handleCropped
          }
        />
      )}
    </div>
  );
}

const ICON_OPTIONS = [
  'Users',
  'MessageSquare',
  'Briefcase',
  'Calendar',
  'GraduationCap',
  'Shield',
  'Zap',
  'Globe',
  'Code',
  'Heart',
  'Star',
  'TrendingUp',
  'Award'
];

export default function LandingPageEditor() {
  const queryClient =
    useQueryClient();

  const {
    data: settings = {}
  } = useQuery({
    queryKey: [
      'site-settings'
    ],

    queryFn:
      async () => {
        const { data } =
          await supabase
            .from(
              'site_settings'
            )
            .select('*');

        const map =
          {};

        data?.forEach(
          (row) => {
            map[
              row.setting_key
            ] =
              row.setting_value;
          }
        );

        return map;
      }
  });

  const saveMutation =
    useMutation({
      mutationFn:
        async ({
          key,
          value
        }) => {
          const { error } =
            await supabase
              .from(
                'site_settings'
              )
              .update({
                setting_value:
                  value
              })
              .eq(
                'setting_key',
                key
              );

          if (error)
            throw error;
        },

      onSuccess: () => {
        toast.success(
          'Saved successfully!'
        );

        queryClient.invalidateQueries(
          {
            queryKey:
              [
                'site-settings'
              ]
          }
        );
      },

      onError: () =>
        toast.error(
          'Failed to save'
        )
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Edit landing
          page sections
          below.
          Changes are
          saved to DB
          instantly.
        </p>

        <Button
          variant="outline"
          size="sm"
          className="glass-card border-0"
          onClick={() =>
            window.open(
              '/',
              '_blank'
            )
          }
        >
          <Eye className="h-4 w-4 mr-2" />

          Preview
          Landing Page

          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <Tabs
        defaultValue="hero"
        className="space-y-4"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="hero">
            Hero
          </TabsTrigger>

          <TabsTrigger value="stats">
            Stats
          </TabsTrigger>

          <TabsTrigger value="features">
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroEditor
            data={
              settings.hero
            }
            onSave={(v) =>
              saveMutation.mutate(
                {
                  key:
                    'hero',

                  value: v
                }
              )
            }
            saving={
              saveMutation.isPending
            }
          />
        </TabsContent>

        <TabsContent value="stats">
          <StatsEditor
            data={
              settings.stats
            }
            onSave={(v) =>
              saveMutation.mutate(
                {
                  key:
                    'stats',

                  value: v
                }
              )
            }
            saving={
              saveMutation.isPending
            }
          />
        </TabsContent>

        <TabsContent value="features">
          <FeaturesEditor
            data={
              settings.features
            }
            onSave={(v) =>
              saveMutation.mutate(
                {
                  key:
                    'features',

                  value: v
                }
              )
            }
            saving={
              saveMutation.isPending
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SaveButton({
  onClick,
  saving
}) {
  return (
    <Button
      onClick={onClick}
      disabled={saving}
      className="mt-4"
    >
      <Save className="h-4 w-4 mr-2" />

      {saving
        ? 'Saving...'
        : 'Save Changes'}
    </Button>
  );
}

function HeroEditor({
  data,
  onSave,
  saving
}) {
  const [form, setForm] =
    useState({
      badge: '',
      title: '',
      highlight:
        '',
      description:
        '',
      cta_text: '',
      cta_secondary:
        '',
      bg_image: ''
    });

  useEffect(() => {
    if (data) {
      setForm({
        ...form,
        ...data
      });
    }
  }, [data]);

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">
          Hero Section
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <ImageUploadField
          label="Hero Background Image"
          value={
            form.bg_image
          }
          onChange={(
            url
          ) =>
            setForm({
              ...form,
              bg_image:
                url
            })
          }
          aspectRatio={
            16 / 9
          }
        />

        <div>
          <Label>
            Badge Text
          </Label>

          <Input
            value={
              form.badge
            }
            onChange={(
              e
            ) =>
              setForm({
                ...form,
                badge:
                  e
                    .target
                    .value
              })
            }
          />
        </div>

        <SaveButton
          onClick={() =>
            onSave(form)
          }
          saving={saving}
        />
      </CardContent>
    </Card>
  );
}

function StatsEditor({
  data,
  onSave,
  saving
}) {
  const [items, setItems] =
    useState([]);

  useEffect(() => {
    if (data)
      setItems(data);
  }, [data]);

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">
          Stats Section
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map(
          (
            item,
            i
          ) => (
            <div
              key={i}
              className="flex gap-3 items-end"
            >
              <div className="flex-1">
                <Label>
                  Value
                </Label>

                <Input
                  value={
                    item.value
                  }
                />
              </div>

              <div className="flex-1">
                <Label>
                  Label
                </Label>

                <Input
                  value={
                    item.label
                  }
                />
              </div>
            </div>
          )
        )}

        <SaveButton
          onClick={() =>
            onSave(items)
          }
          saving={saving}
        />
      </CardContent>
    </Card>
  );
}

function FeaturesEditor({
  data,
  onSave,
  saving
}) {
  const [items, setItems] =
    useState([]);

  useEffect(() => {
    if (data)
      setItems(data);
  }, [data]);

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">
          Features
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.map(
          (
            item,
            i
          ) => (
            <div
              key={i}
              className="p-4 border rounded-lg"
            >
              <Input
                value={
                  item.title
                }
              />
            </div>
          )
        )}

        <SaveButton
          onClick={() =>
            onSave(items)
          }
          saving={saving}
        />
      </CardContent>
    </Card>
  );
}
