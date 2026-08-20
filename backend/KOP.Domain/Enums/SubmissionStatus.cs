using System.ComponentModel;

namespace KOP.Domain.Enums;

public enum SubmissionStatus
{
    [Description("Πρόχειρο")]
    Draft = 1,
    
    [Description("Υποβλήθηκε")]
    Submitted = 2,
    
    [Description("Επιστράφηκε για Διόρθωση")]
    ReturnedForCorrection = 3,
    
    [Description("Επαναϋποβλήθηκε")]
    Resubmitted = 4
}