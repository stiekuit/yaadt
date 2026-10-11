
import React, { useState } from 'react';
import { Play, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseWebhookResponse } from '@/services/chatService';

interface TestResult {
  success: boolean;
  status?: number;
  statusText?: string;
  responseTime: number;
  requestDetails: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  responseDetails: {
    headers?: Record<string, string>;
    body: string;
    parsedText?: string;
  };
  error?: string;
  timestamp: string;
}

interface ApiTesterProps {
  initialUrl?: string;
  onTestComplete?: (result: TestResult) => void;
}

const ApiTester: React.FC<ApiTesterProps> = ({ initialUrl = '', onTestComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [method, setMethod] = useState<'GET' | 'POST'>('POST');
  const [url, setUrl] = useState(initialUrl);
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState(() => {
    const realisticPayload = {
      message: "Test connection from Advanced API Tester",
      timestamp: new Date().toISOString(),
      userId: "support-portal-user",
      sessionId: `test-session-${Date.now()}`,
      chatType: "support",
      sessionTitle: "Test Chat Session",
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Support Portal Test',
      source: "api-tester"
    };
    return JSON.stringify(realisticPayload, null, 2);
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showDebugLogs, setShowDebugLogs] = useState(false);

  const loadPresetPayload = (type: string) => {
    const timestamp = new Date().toISOString();
    const sessionId = `test-session-${Date.now()}`;
    
    const payloads = {
      realistic: {
        message: "Test connection with realistic chat payload",
        timestamp,
        userId: "support-portal-user",
        sessionId,
        chatType: "support",
        sessionTitle: "Test Chat Session",
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Support Portal Test',
        source: "api-tester"
      },
      minimal: {
        message: "Test connection",
        timestamp,
        userId: "test-user"
      },
      extended: {
        message: "Comprehensive test with all possible fields",
        timestamp,
        userId: "support-portal-user",
        sessionId,
        chatType: "support",
        sessionTitle: "Comprehensive Test Session",
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Support Portal Test',
        source: "api-tester",
        customerInfo: {
          name: "Test Customer",
          email: "test@example.com",
          phone: "+1234567890"
        },
        metadata: {
          testRun: true,
          environment: "development",
          version: "1.0.0"
        }
      }
    };

    const selectedPayload = payloads[type as keyof typeof payloads] || payloads.realistic;
    setBody(JSON.stringify(selectedPayload, null, 2));
  };

  const performTest = async () => {
    if (!url.trim()) {
      setTestResult({
        success: false,
        error: 'URL is required',
        responseTime: 0,
        requestDetails: { method, url, headers: {}, body: undefined },
        responseDetails: { body: '' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setTesting(true);
    const startTime = Date.now();
    
    try {
      let parsedHeaders: Record<string, string> = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        console.warn('Invalid headers JSON, using default');
        parsedHeaders = { 'Content-Type': 'application/json' };
      }

      const requestOptions: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      if (method === 'POST' && body.trim()) {
        requestOptions.body = body;
      }

      console.log('🚀 API Test Request:', requestOptions);
      
      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const responseText = await response.text();
      console.log('📨 API Test Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });

      // Test response parsing
      const parsedText = parseWebhookResponse(responseText);
      console.log('🔄 Parsed Response:', parsedText);

      const result: TestResult = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        requestDetails: {
          method,
          url,
          headers: parsedHeaders,
          body: method === 'POST' ? body : undefined,
        },
        responseDetails: {
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
          parsedText,
        },
        timestamp: new Date().toISOString(),
      };

      setTestResult(result);
      onTestComplete?.(result);
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.error('❌ API Test Error:', error);
      
      const result: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        requestDetails: {
          method,
          url,
          headers: JSON.parse(headers || '{}'),
          body: method === 'POST' ? body : undefined,
        },
        responseDetails: { body: '' },
        timestamp: new Date().toISOString(),
      };

      setTestResult(result);
      onTestComplete?.(result);
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'destructive';
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Bug className="w-4 h-4" />
          <span>API Testing</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        <Button
          onClick={performTest}
          disabled={testing || !url.trim()}
          className="flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          {testing ? 'Testing...' : 'Test API'}
        </Button>
      </div>

      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Request Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Method</Label>
                <Select value={method} onValueChange={(value: 'GET' | 'POST') => setMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Label>URL</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
            </div>

            <div>
              <Label>Headers (JSON)</Label>
              <Textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
            </div>

            {method === 'POST' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Request Body (JSON)</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadPresetPayload('realistic')}
                    >
                      Realistic
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadPresetPayload('minimal')}
                    >
                      Minimal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadPresetPayload('extended')}
                    >
                      Extended
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder="Enter JSON payload here..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Test Results</span>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <Badge variant={getStatusColor(testResult.status)}>
                  {testResult.status ? `${testResult.status} ${testResult.statusText}` : 'Failed'}
                </Badge>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{testResult.responseTime}ms</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResult.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 font-medium">Error:</p>
                <p className="text-sm text-red-600">{testResult.error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Request Details</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-xs"><strong>Method:</strong> {testResult.requestDetails.method}</p>
                  <p className="text-xs"><strong>URL:</strong> {testResult.requestDetails.url}</p>
                  <div className="text-xs">
                    <strong>Headers:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(testResult.requestDetails.headers, null, 2)}
                    </pre>
                  </div>
                  {testResult.requestDetails.body && (
                    <div className="text-xs">
                      <strong>Body:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto max-h-20">
                        {testResult.requestDetails.body}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Response Details</h4>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  {testResult.responseDetails.headers && (
                    <div className="text-xs">
                      <strong>Headers:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto max-h-16">
                        {JSON.stringify(testResult.responseDetails.headers, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="text-xs">
                    <strong>Raw Body:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto max-h-20 bg-white p-2 border">
                      {testResult.responseDetails.body || '(empty)'}
                    </pre>
                  </div>
                  {testResult.responseDetails.parsedText && (
                    <div className="text-xs">
                      <strong>Parsed Text (What users see):</strong>
                      <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                        {testResult.responseDetails.parsedText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-gray-500">
                Tested at: {new Date(testResult.timestamp).toLocaleString()}
              </p>
              <Button
                onClick={() => setShowDebugLogs(!showDebugLogs)}
                variant="outline"
                size="sm"
              >
                {showDebugLogs ? 'Hide' : 'Show'} Debug Logs
              </Button>
            </div>

            {showDebugLogs && (
              <div className="bg-gray-900 text-green-400 p-3 rounded-md text-xs font-mono max-h-40 overflow-y-auto">
                <p>Check browser console for detailed parsing logs...</p>
                <p>Look for messages starting with 🔍, ✅, ❌, 🔄</p>
                <p className="mt-2 text-yellow-400">Tip: Use browser DevTools Network tab to see the actual request/response</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiTester;
