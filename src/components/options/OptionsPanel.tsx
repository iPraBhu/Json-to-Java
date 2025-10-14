import { useEffect, useMemo } from 'react';
import { useOptionsStore } from '../../state/options';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const accessOptions = [
  { label: 'Private fields', value: 'private', description: 'Generate private fields with accessors.' },
  { label: 'Public fields', value: 'public', description: 'Use public fields without accessors.' }
] as const;

const annotationOptions = [
  { label: 'Jackson', value: 'jackson' },
  { label: 'Gson', value: 'gson' },
  { label: 'Moshi', value: 'moshi' },
  { label: 'None', value: 'none' }
] as const;

const collectionOptions = [
  { label: 'List', value: 'list' },
  { label: 'Set', value: 'set' }
] as const;

const dateOptions = [
  { label: 'java.time OffsetDateTime', value: 'java-time' },
  { label: 'java.util.Date', value: 'util-date' }
] as const;

const nullOptions = [
  { label: 'Boxed types (Integer, Boolean)', value: 'boxed' },
  { label: 'Optional<T>', value: 'optional' }
] as const;

const arrayOptions = [
  { label: 'Tolerant merge', value: 'tolerant' },
  { label: 'Strict (first item)', value: 'strict' }
] as const;

const numberOptions = [
  { label: 'Integer', value: 'integer' },
  { label: 'Long', value: 'long' },
  { label: 'Double', value: 'double' }
] as const;

const resolveLabel = <T extends { value: string; label: string }>(
  options: readonly T[],
  value: string
): string => options.find((option) => option.value === value)?.label ?? options[0]?.label ?? '';

export const OptionsPanel = () => {
  const { options, setOptions } = useOptionsStore();

  const builderDisabled = useMemo(() => !options.useLombokData, [options.useLombokData]);

  useEffect(() => {
    if (!options.useLombokData && options.useLombokBuilder) {
      setOptions({ useLombokBuilder: false });
    }
  }, [options.useLombokData, options.useLombokBuilder, setOptions]);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Generation Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="package">Package name</Label>
            <Input
              id="package"
              inputMode="text"
              spellCheck={false}
              value={options.packageName ?? ''}
              placeholder="com.example"
              onChange={(event) => setOptions({ packageName: event.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="root-class">Root class</Label>
            <Input
              id="root-class"
              inputMode="text"
              spellCheck={false}
              value={options.rootClassName}
              onChange={(event) => setOptions({ rootClassName: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Field access</Label>
            <Select
              value={options.fieldAccess}
              onValueChange={(value) => setOptions({ fieldAccess: value as typeof options.fieldAccess })}
            >
              <SelectTrigger>
                <SelectValue aria-label={`Field access: ${options.fieldAccess}`}>
                  {resolveLabel(accessOptions, options.fieldAccess)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {accessOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <div className="flex flex-col text-left">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Annotations</Label>
            <Select
              value={options.annotations}
              onValueChange={(value) => setOptions({ annotations: value as typeof options.annotations })}
            >
              <SelectTrigger>
                <SelectValue aria-label={`Annotations: ${options.annotations}`}>
                  {resolveLabel(annotationOptions, options.annotations)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {annotationOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Collections</Label>
            <Select
              value={options.collectionType}
              onValueChange={(value) => setOptions({ collectionType: value as typeof options.collectionType })}
            >
              <SelectTrigger>
                <SelectValue aria-label={`Collections: ${options.collectionType}`}>
                  {resolveLabel(collectionOptions, options.collectionType)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {collectionOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Date type</Label>
            <Select
              value={options.dateType}
              onValueChange={(value) => setOptions({ dateType: value as typeof options.dateType })}
            >
              <SelectTrigger>
                <SelectValue aria-label={`Date type: ${options.dateType}`}>
                  {resolveLabel(dateOptions, options.dateType)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Null handling</Label>
            <Select
              value={options.nullStrategy}
              onValueChange={(value) => setOptions({ nullStrategy: value as typeof options.nullStrategy })}
            >
              <SelectTrigger>
                <SelectValue aria-label={`Null handling: ${options.nullStrategy}`}>
                  {resolveLabel(nullOptions, options.nullStrategy)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {nullOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Array inference</Label>
            <Select
              value={options.arrayInference}
              onValueChange={(value) => setOptions({ arrayInference: value as typeof options.arrayInference })}
            >
              <SelectTrigger>
                <SelectValue aria-label={`Array inference: ${options.arrayInference}`}>
                  {resolveLabel(arrayOptions, options.arrayInference)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {arrayOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Numeric strategy</Label>
            <Select
              value={options.numberStrategy}
              onValueChange={(value) => setOptions({ numberStrategy: value as typeof options.numberStrategy })}
            >
              <SelectTrigger>
                <SelectValue aria-label={`Numeric strategy: ${options.numberStrategy}`}>
                  {resolveLabel(numberOptions, options.numberStrategy)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {numberOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Use Lombok @Data</p>
              <p className="text-xs text-muted-foreground">Generates Lombok data classes instead of manual accessors.</p>
            </div>
            <Switch checked={options.useLombokData} onCheckedChange={(checked) => setOptions({ useLombokData: checked })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 opacity-100">
            <div>
              <p className="text-sm font-medium">Use Lombok @Builder</p>
              <p className="text-xs text-muted-foreground">Requires @Data to be enabled.</p>
            </div>
            <Switch
              checked={options.useLombokBuilder}
              disabled={builderDisabled}
              onCheckedChange={(checked) => setOptions({ useLombokBuilder: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Generate enums</p>
              <p className="text-xs text-muted-foreground">Create enums when schema defines enumerated values.</p>
            </div>
            <Switch checked={options.generateEnums} onCheckedChange={(checked) => setOptions({ generateEnums: checked })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Stable naming</p>
              <p className="text-xs text-muted-foreground">Reuse class names for identical shapes.</p>
            </div>
            <Switch checked={options.stableNames} onCheckedChange={(checked) => setOptions({ stableNames: checked })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Nested classes</p>
              <p className="text-xs text-muted-foreground">Place supporting classes inside the root class.</p>
            </div>
            <Switch checked={options.innerClasses} onCheckedChange={(checked) => setOptions({ innerClasses: checked })} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
