using System.ComponentModel;

namespace KOP.Domain.Enums;

public enum DapaniLeitourgiasEgkatastasis
{
    Undefined = 0,
    
    [Description("Ηλεκτρικό Ρεύμα")]
    IlektrikoRevma = 1,
    
    [Description("Ύδρευση")]
    Ydrefsi = 2,

    [Description("Τηλεπικοινωνίες")]
    Tilepikoinonies = 3
}