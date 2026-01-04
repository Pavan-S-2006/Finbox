import { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { Mic, Upload, Check, Loader2, FileText, Plus, X, Edit2, Trash2, Calendar, Clock, TrendingUp, TrendingDown, ChevronsUpDown } from 'lucide-react';
import { transcribeAudio, analyzeImage } from '../services/googleAi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Custom Searchable Combobox Component
const CategorySelector = ({ value, onChange, categories, t }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const containerRef = useRef(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search === value
    ? categories
    : categories.filter(cat =>
      cat.toLowerCase().includes(search.toLowerCase())
    );

  const handleSelect = (cat) => {
    onChange(cat);
    setSearch(cat);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.target.select();
          }}
          placeholder="Select or type category..."
          className="pr-10"
        />
        <Button
          size="icon"
          variant="ghost"
          type="button"
          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
          onClick={() => setOpen(!open)}
        >
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-[200px] overflow-auto animate-in fade-in zoom-in-95 duration-100">
          {filtered.length === 0 && search && (
            <div
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground text-primary font-medium"
              onClick={() => handleSelect(search)}
            >
              Create "{search}"
            </div>
          )}
          {filtered.map(cat => (
            <div
              key={cat}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                value === cat && "bg-accent/50"
              )}
              onClick={() => handleSelect(cat)}
            >
              {t(cat)}
              {value === cat && <Check className="h-4 w-4" />}
            </div>
          ))}
          {filtered.length === 0 && !search && (
            <div className="p-2 text-sm text-muted-foreground text-center">Start typing...</div>
          )}
        </div>
      )}
    </div>
  );
};

const SmartEntry = () => {
  const { addTransaction, parseVoiceInput, parseReceiptInput, transactions, updateTransaction, deleteTransaction } = useFinance();
  const { t } = useTheme();

  // Quick Entry State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [paymentSource, setPaymentSource] = useState('budget');

  // Voice/Upload State
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [processingType, setProcessingType] = useState(null);
  const [parsedTransaction, setParsedTransaction] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [enableVoicePreview, setEnableVoicePreview] = useState(false);

  // Media Recorder Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Table State
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, expense, income

  // Fast Track Edit State
  const [fastTrackItems, setFastTrackItems] = useState(() => {
    const saved = localStorage.getItem('fastTrackItems');
    return saved ? JSON.parse(saved) : [
      { id: 1, label: 'Coffee', amount: 150, cat: 'Food' },
      { id: 2, label: 'Fuel', amount: 500, cat: 'Transport' },
      { id: 3, label: 'Movie', amount: 300, cat: 'Entertainment' },
      { id: 4, label: 'Groceries', amount: 1000, cat: 'Shopping' },
    ];
  });
  const [editingFastTrack, setEditingFastTrack] = useState(null);
  const [showFastTrackEdit, setShowFastTrackEdit] = useState(false);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [filterMonth, setFilterMonth] = useState('all');

  // Define separate categories for expenses and incomes
  const expenseCategories = [
    'Housing', 'Food', 'Groceries', 'Dining Out', 'Transport', 'Utilities',
    'Entertainment', 'Shopping', 'Health', 'Education', 'Personal Care',
    'Travel', 'Insurance', 'Debt', 'Gifts', 'Family', 'Pets', 'Other'
  ];
  const incomeCategories = [
    'Salary', 'Business', 'Freelance', 'Investment', 'Rental',
    'Interest', 'Dividend', 'Gift', 'Bonus', 'Refund', 'Other'
  ];

  // Get current categories based on type
  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  // Reset category to first option when type changes
  useEffect(() => {
    setCategory('');
  }, [type]);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description: description || 'Manual Entry',
      paymentSource: type === 'expense' ? paymentSource : 'budget',
      date: new Date().toISOString(),
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    setPaymentSource('budget');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsListening(true);
      setProcessingType('voice');
      setVoiceText('');
      setParsedTransaction(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

          const transcript = await transcribeAudio(audioBlob);
          setVoiceText(transcript);

          if (!transcript) {
            alert("Could not understand audio. Please try again.");
            return;
          }

          // Auto-parse if preview is disabled, otherwise let user review
          if (!enableVoicePreview) {
            const parsed = parseVoiceInput(transcript);
            setParsedTransaction(parsed);
          }
        } catch (err) {
          console.error("Transcription error:", err);
          alert("Could not process voice command.");
        } finally {
          setProcessingType(null);
        }
      };
    }
  };

  const handleParseVoiceText = () => {
    if (voiceText) {
      const parsed = parseVoiceInput(voiceText);
      setParsedTransaction(parsed);
    }
  };

  const confirmVoiceTransaction = () => {
    if (parsedTransaction) {
      addTransaction(parsedTransaction);
      resetVoiceForm();
    }
  };

  const resetVoiceForm = () => {
    setVoiceText('');
    setParsedTransaction(null);
    setIsRecording(false);
    setIsListening(false);
    setProcessingType(null);
  };

  const handleFileUpload = async (files) => {
    if (files && files[0]) {
      setProcessingType('file');
      try {
        const text = await analyzeImage(files[0]);
        setVoiceText(text);

        if (text) {
          const parsed = parseReceiptInput(text);
          setParsedTransaction(parsed);
        } else {
          alert("Could not extract text from the file.");
        }
      } catch (err) {
        console.error("File analysis error:", err);
        alert("Could not process the file.");
      } finally {
        setProcessingType(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Table Functions
  const handleEditTransaction = (transaction) => {
    setEditingTransaction({ ...transaction });
    setShowEditModal(true);
  };

  const handleDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    }
  };

  const saveEditedTransaction = () => {
    if (editingTransaction) {
      updateTransaction(editingTransaction);
      setShowEditModal(false);
      setEditingTransaction(null);
    }
  };

  // Fast Track Functions
  const handleEditFastTrack = (item) => {
    setEditingFastTrack({ ...item });
    setShowFastTrackEdit(true);
  };

  const saveFastTrackEdit = () => {
    if (editingFastTrack) {
      const updatedItems = fastTrackItems.map(item =>
        item.id === editingFastTrack.id ? editingFastTrack : item
      );
      setFastTrackItems(updatedItems);
      localStorage.setItem('fastTrackItems', JSON.stringify(updatedItems));
      setShowFastTrackEdit(false);
      setEditingFastTrack(null);
    }
  };

  const handleAddFastTrack = () => {
    const newId = Math.max(...fastTrackItems.map(item => item.id), 0) + 1;
    setEditingFastTrack({
      id: newId,
      label: '',
      amount: 0,
      cat: 'Food',
      type: 'expense',
      paymentSource: 'budget'
    });
    setShowFastTrackEdit(true);
  };

  const handleDeleteFastTrack = (itemId) => {
    const updatedItems = fastTrackItems.filter(item => item.id !== itemId);
    setFastTrackItems(updatedItems);
    localStorage.setItem('fastTrackItems', JSON.stringify(updatedItems));
  };

  const saveFastTrackItem = () => {
    if (editingFastTrack) {
      // Check if editing existing or creating new
      const existingIndex = fastTrackItems.findIndex(item => item.id === editingFastTrack.id);
      let updatedItems;

      if (existingIndex !== -1) {
        // Update existing
        updatedItems = fastTrackItems.map(item =>
          item.id === editingFastTrack.id ? editingFastTrack : item
        );
      } else {
        // Add new
        updatedItems = [...fastTrackItems, editingFastTrack];
      }

      setFastTrackItems(updatedItems);
      localStorage.setItem('fastTrackItems', JSON.stringify(updatedItems));
      setShowFastTrackEdit(false);
      setEditingFastTrack(null);
    }
  };


  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return { dateStr, timeStr };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailableMonths = () => {
    const months = new Set();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const formatMonthLabel = (monthKey) => {
    if (monthKey === 'all') return 'All Months';
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const availableMonths = getAvailableMonths();

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filterType === 'all' || t.type === filterType;
    let monthMatch = true;
    if (filterMonth !== 'all') {
      const date = new Date(t.date);
      const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMatch = transactionMonth === filterMonth;
    }
    return typeMatch && monthMatch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('entry')}</h1>
        <p className="text-muted-foreground">{t('smartEntrySub')}</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="scan">Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('addItem')}</CardTitle>
                <CardDescription>Enter transaction details manually</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuickSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('amount')}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="pl-7"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('Type')}</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">{t('expense')}</SelectItem>
                          <SelectItem value="income">{t('income')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {type === 'expense' && (
                    <div className="space-y-2">
                      <Label>Payment Source</Label>
                      <Select value={paymentSource} onValueChange={setPaymentSource}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">Monthly Budget</SelectItem>
                          <SelectItem value="savings">From Savings</SelectItem>
                          <SelectItem value="credit">On Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t('description')}</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('descPlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('category')}</Label>
                    <CategorySelector
                      value={category}
                      onChange={setCategory}
                      categories={categories}
                      t={t}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addTransaction')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('fastTrack')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-2 gap-3">
                    {fastTrackItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <Button
                          variant="outline"
                          className="h-auto flex-col p-4 gap-1 w-full"
                          onClick={() => addTransaction({
                            type: item.type || 'expense',
                            amount: item.amount,
                            category: item.cat,
                            description: item.label,
                            paymentSource: (item.type || 'expense') === 'expense' ? (item.paymentSource || 'budget') : 'budget',
                            date: new Date().toISOString(),
                          })}
                        >
                          <span className="font-semibold">{item.label}</span>
                          <span className="text-xs text-muted-foreground">₹{item.amount}</span>
                        </Button>
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-background/80 hover:bg-background"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFastTrack(item);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFastTrack(item.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {/* Add New Button */}
                    <Button
                      variant="outline"
                      className="h-auto flex-col p-4 gap-1 border-dashed"
                      onClick={handleAddFastTrack}
                    >
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add New</span>
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{t('voiceEntry')}</CardTitle>
                  <CardDescription>{t('voiceExample')}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="voice-preview"
                    checked={enableVoicePreview}
                    onChange={(e) => setEnableVoicePreview(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="voice-preview" className="text-sm cursor-pointer">
                    Review before parsing
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-6">
              {!isRecording && !voiceText && !parsedTransaction && (
                <Button size="lg" className="h-24 w-24 rounded-full" onClick={startRecording}>
                  <Mic className="h-8 w-8" />
                </Button>
              )}

              {isListening && (
                <div className="space-y-4">
                  <div className="relative inline-flex">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                    <Mic className="h-12 w-12 text-primary relative z-10" />
                  </div>
                  <p className="animate-pulse font-medium">{t('listening')}</p>
                  <Button variant="destructive" size="sm" onClick={stopRecording}>
                    {t('stop')}
                  </Button>
                </div>
              )}

              {/* Show editable transcript */}
              {voiceText && !parsedTransaction && (
                <div className="w-full max-w-md space-y-4">
                  <div className="space-y-2 text-left">
                    <Label>Voice Input</Label>
                    <textarea
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background resize-none"
                      placeholder="Edit your voice input..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Review and edit the transcribed text before parsing
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleParseVoiceText}>
                      Parse Transaction
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={resetVoiceForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {parsedTransaction && (
                <div className="w-full max-w-sm space-y-4 border rounded-lg p-4 bg-muted/50">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold">₹{parsedTransaction.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description:</span>
                      <span>{parsedTransaction.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{parsedTransaction.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={confirmVoiceTransaction}>{t('confirm')}</Button>
                    <Button variant="outline" className="flex-1" onClick={resetVoiceForm}>{t('retry')}</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{t('scanReceipt')}</CardTitle>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="scan-preview"
                    checked={enableVoicePreview}
                    onChange={(e) => setEnableVoicePreview(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="scan-preview" className="text-sm cursor-pointer">
                    Review before parsing
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                  dragActive ? "border-primary bg-primary/5" : "hover:border-primary hover:bg-muted/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                {processingType === 'file' ? (
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium">{t('uploadPlaceholder')}</p>
                    <p className="text-xs text-muted-foreground mt-2">{t('uploadLimits')}</p>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.csv"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View and manage all your entries</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>{formatMonthLabel(month)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const { dateStr, timeStr } = formatDateTime(transaction.date);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{dateStr}</span>
                          <span className="text-xs text-muted-foreground">{timeStr}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                          {transaction.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1 text-xs font-medium", transaction.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                          {transaction.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {transaction.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(transaction)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTransaction(transaction)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editingTransaction.category} onValueChange={(val) => setEditingTransaction({ ...editingTransaction, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(editingTransaction.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={saveEditedTransaction}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {transactionToDelete && (
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium">{transactionToDelete.description}</p>
              <p className={transactionToDelete.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(transactionToDelete.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fast Track Edit Modal */}
      <Dialog open={showFastTrackEdit} onOpenChange={setShowFastTrackEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fast Track Item</DialogTitle>
            <DialogDescription>
              Customize your quick-add button
            </DialogDescription>
          </DialogHeader>
          {editingFastTrack && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={editingFastTrack.amount}
                    onChange={(e) => setEditingFastTrack({ ...editingFastTrack, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editingFastTrack.type || 'expense'}
                    onValueChange={(val) => {
                      const newCats = val === 'expense' ? expenseCategories : incomeCategories;
                      setEditingFastTrack({
                        ...editingFastTrack,
                        type: val,
                        cat: newCats[0]
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(editingFastTrack.type || 'expense') === 'expense' && (
                <div className="space-y-2">
                  <Label>Payment Source</Label>
                  <Select
                    value={editingFastTrack.paymentSource || 'budget'}
                    onValueChange={(val) => setEditingFastTrack({ ...editingFastTrack, paymentSource: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Monthly Budget</SelectItem>
                      <SelectItem value="savings">From Savings</SelectItem>
                      <SelectItem value="credit">On Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={editingFastTrack.label}
                  onChange={(e) => setEditingFastTrack({ ...editingFastTrack, label: e.target.value })}
                  placeholder="e.g., Coffee, Lunch"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <CategorySelector
                  value={editingFastTrack.cat}
                  onChange={(val) => setEditingFastTrack({ ...editingFastTrack, cat: val })}
                  categories={(editingFastTrack.type === 'income' ? incomeCategories : expenseCategories) || expenseCategories}
                  t={t}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFastTrackEdit(false)}>Cancel</Button>
            <Button onClick={saveFastTrackItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default SmartEntry;
