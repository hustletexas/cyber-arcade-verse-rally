import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, FileJson, Image, Download, ExternalLink } from 'lucide-react';

interface TokenMetadataJSON {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

export const TokenMetadataGenerator = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const [metadata, setMetadata] = useState<TokenMetadataJSON>({
    name: 'Cyber City Token',
    symbol: 'CCTR',
    description: 'The official CCTR utility token for the Cyber City gaming ecosystem. Use CCTR to participate in tournaments, purchase in-game items, and earn rewards.',
    image: '',
    external_url: '',
    attributes: [],
  });

  const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' });

  const generateJSON = () => {
    return JSON.stringify(metadata, null, 2);
  };

  const copyToClipboard = async () => {
    const json = generateJSON();
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Metadata JSON copied to clipboard",
    });
  };

  const downloadJSON = () => {
    const json = generateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.symbol.toLowerCase()}-metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: `${metadata.symbol.toLowerCase()}-metadata.json saved`,
    });
  };

  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setMetadata({
        ...metadata,
        attributes: [...metadata.attributes, { ...newAttribute }],
      });
      setNewAttribute({ trait_type: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    setMetadata({
      ...metadata,
      attributes: metadata.attributes.filter((_, i) => i !== index),
    });
  };

  return (
    <Card className="arcade-frame bg-background/80 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileJson className="h-6 w-6" />
          Token Metadata Generator
        </CardTitle>
        <CardDescription>
          Create a Metaplex-compatible metadata JSON file for your token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meta-name">Token Name</Label>
            <Input
              id="meta-name"
              value={metadata.name}
              onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              className="bg-background/50"
              placeholder="Cyber City Token"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-symbol">Symbol</Label>
            <Input
              id="meta-symbol"
              value={metadata.symbol}
              onChange={(e) => setMetadata({ ...metadata, symbol: e.target.value })}
              className="bg-background/50"
              placeholder="CCTR"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="meta-description">Description</Label>
          <Textarea
            id="meta-description"
            value={metadata.description}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            className="bg-background/50 min-h-[100px]"
            placeholder="Describe your token's purpose and utility..."
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="meta-image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logo Image URL
          </Label>
          <Input
            id="meta-image"
            value={metadata.image}
            onChange={(e) => setMetadata({ ...metadata, image: e.target.value })}
            className="bg-background/50 font-mono text-sm"
            placeholder="ipfs://... or https://..."
          />
          <p className="text-xs text-muted-foreground">
            Upload your logo to IPFS first (using NFT.Storage or Pinata), then paste the URL here
          </p>
        </div>

        {/* Image Preview */}
        {metadata.image && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Label className="text-sm text-muted-foreground mb-2 block">Logo Preview</Label>
            <div className="flex items-center gap-4">
              <img 
                src={metadata.image.replace('ipfs://', 'https://nftstorage.link/ipfs/')} 
                alt="Token logo preview"
                className="w-16 h-16 rounded-lg object-cover border border-primary/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <span className="text-sm text-muted-foreground truncate flex-1 font-mono">
                {metadata.image}
              </span>
            </div>
          </div>
        )}

        {/* External URL */}
        <div className="space-y-2">
          <Label htmlFor="meta-external" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            External URL (optional)
          </Label>
          <Input
            id="meta-external"
            value={metadata.external_url}
            onChange={(e) => setMetadata({ ...metadata, external_url: e.target.value })}
            className="bg-background/50"
            placeholder="https://your-website.com"
          />
        </div>

        {/* Attributes */}
        <div className="space-y-3">
          <Label>Attributes (optional)</Label>
          
          {metadata.attributes.length > 0 && (
            <div className="space-y-2">
              {metadata.attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border/50">
                  <span className="text-sm font-medium">{attr.trait_type}:</span>
                  <span className="text-sm text-muted-foreground">{attr.value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeAttribute(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Trait type"
              value={newAttribute.trait_type}
              onChange={(e) => setNewAttribute({ ...newAttribute, trait_type: e.target.value })}
              className="bg-background/50"
            />
            <Input
              placeholder="Value"
              value={newAttribute.value}
              onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
              className="bg-background/50"
            />
            <Button 
              variant="outline" 
              onClick={addAttribute}
              disabled={!newAttribute.trait_type || !newAttribute.value}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Generated JSON Preview */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span>Generated JSON</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="h-7 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadJSON}
                className="h-7 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </Label>
          <pre className="p-4 rounded-lg bg-background/80 border border-border/50 overflow-x-auto text-xs font-mono text-foreground/80">
            {generateJSON()}
          </pre>
        </div>

        {/* Upload Instructions */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-2">
          <h4 className="font-semibold text-blue-400 text-sm">Next Steps</h4>
          <ol className="text-sm text-blue-200/80 space-y-1 list-decimal list-inside">
            <li>Upload your token logo to IPFS (use <a href="https://nft.storage" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NFT.Storage</a>)</li>
            <li>Paste the IPFS URL in the "Logo Image URL" field above</li>
            <li>Download or copy the generated JSON</li>
            <li>Upload the JSON file to IPFS</li>
            <li>Use the JSON's IPFS URL as the "Metadata URI" in the Token Creator</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
