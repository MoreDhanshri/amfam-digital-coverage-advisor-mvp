# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
lookup_coverage_faq — Deterministic FAQ Knowledge Retrieval Tool

PURPOSE:
    Provides exact canonical answers for all American Family Insurance
    (APEX Auto, APEX Home, Bundling, Navigation & Billing) FAQ items.

STRICT COMPLIANCE REQUIREMENT:
    The returned `exact_answer` MUST be output by the agent character-for-character
    with zero paraphrasing, summarizing, or introductory pleasantries.
"""

from typing import Any, Dict, Optional

# Canonical FAQ Knowledge Base mapping question keys to exact Question and Answer texts.
FAQ_DATABASE: Dict[str, Dict[str, str]] = {
    # 🚗 APEX Auto — Liability Coverages
    "bodily_injury_liability": {
        "category": "auto_liability",
        "question": "What is Bodily Injury (BI) liability coverage and why do I need it?",
        "answer": "Bodily Injury covers costs if you injure someone else in an accident — including their medical bills, lost wages, and legal fees if they sue you. It is required in most states and protects your personal assets.",
    },
    "property_damage_liability": {
        "category": "auto_liability",
        "question": "What does Property Damage (PD) liability cover?",
        "answer": "Property Damage pays for damage you cause to someone else's vehicle or property (e.g., a fence, building, or parked car) in an at-fault accident.",
    },
    "bodily_injury_limits_100_300": {
        "category": "auto_liability",
        "question": "What is the difference between Bodily Injury limits like 100/300?",
        "answer": "The first number ($100,000) is the maximum paid per person injured; the second ($300,000) is the maximum paid per accident regardless of how many people are injured.",
    },
    "how_much_liability_needed": {
        "category": "auto_liability",
        "question": "How much Bodily Injury and Property Damage coverage do I actually need?",
        "answer": "A common recommendation is to carry limits at least equal to your net worth. Higher limits protect your savings and assets if you are sued after a serious accident.",
    },
    "uninsured_motorist_um": {
        "category": "auto_liability",
        "question": "What is Uninsured Motorist (UM) coverage and do I need it?",
        "answer": "UM coverage pays for your injuries and damages if you are hit by a driver who has no insurance. It is required in many states.",
    },
    "underinsured_motorist_uim": {
        "category": "auto_liability",
        "question": "What is Underinsured Motorist (UIM) coverage?",
        "answer": "UIM coverage kicks in when the at-fault driver has insurance, but their limits are not enough to cover your full losses. It fills the gap between their coverage and your actual costs.",
    },
    "reject_um_uim": {
        "category": "auto_liability",
        "question": "Can I reject Uninsured or Underinsured Motorist coverage?",
        "answer": "In some states you may reject UM or UIM coverage in writing, but in others (such as Nebraska, South Dakota, New Hampshire, and Minnesota) rejection is not permitted. The option to reject will only appear if your state allows it.",
    },
    "difference_um_uim": {
        "category": "auto_liability",
        "question": "What is the difference between UM and UIM — do I need both?",
        "answer": "UM covers you when the other driver has no insurance at all. UIM covers you when they have some insurance but not enough. Carrying both provides the most complete protection.",
    },

    # 🚗 APEX Auto — Physical Damage Coverages & Deductibles
    "comprehensive_coverage": {
        "category": "auto_physical_damage",
        "question": "What is Comprehensive coverage and what does it cover?",
        "answer": "Comprehensive covers damage to your vehicle from events other than a collision — such as theft, vandalism, fire, hail, flooding, or hitting an animal.",
    },
    "collision_coverage": {
        "category": "auto_physical_damage",
        "question": "What is Collision coverage?",
        "answer": "Collision covers damage to your vehicle when it collides with another vehicle or object, regardless of who is at fault.",
    },
    "difference_comprehensive_collision": {
        "category": "auto_physical_damage",
        "question": "What is the difference between Comprehensive and Collision?",
        "answer": "Comprehensive covers non-collision events (weather, theft, animals). Collision covers accidents involving impact with another vehicle or object. Many lenders require both if you have a car loan or lease.",
    },
    "how_to_choose_deductible": {
        "category": "auto_physical_damage",
        "question": "How do I choose between a $250, $500, or $1,000 deductible for Comprehensive or Collision?",
        "answer": "A higher deductible lowers your premium but means you pay more out of pocket when you file a claim. If you have savings to cover a higher deductible, it can be a smart trade-off. If cash flow is tight, a lower deductible provides more predictable costs.",
    },
    "collision_deductible_rate_impact": {
        "category": "auto_physical_damage",
        "question": "If I lower my Collision deductible, how much more will I pay per month?",
        "answer": "The premium impact depends on your vehicle, location, and driving history. Use the \"Calculate new rate\" button after making a change to see the updated premium in real time.",
    },

    # 🚗 APEX Auto — Optional / Add-On Coverages
    "rental_reimbursement": {
        "category": "auto_addons",
        "question": "What is Rental Reimbursement coverage and is it worth adding?",
        "answer": "Rental Reimbursement pays for a rental car while your vehicle is being repaired after a covered claim. If you rely on your car daily and do not have an alternative, it is generally worth the small additional cost.",
    },
    "roadside_assistance_era": {
        "category": "auto_addons",
        "question": "What is Emergency Roadside Assistance (ERA)?",
        "answer": "ERA covers services like towing, flat tire changes, battery jump-starts, and lockout assistance. Costco Executive members may have this defaulted to \"Included\" on their quote.",
    },
    "oem_parts_coverage": {
        "category": "auto_addons",
        "question": "What is OEM Parts coverage?",
        "answer": "OEM (Original Equipment Manufacturer) Parts coverage ensures your vehicle is repaired using factory-original parts rather than aftermarket alternatives. It is available for vehicles generally up to 11 model years old and requires Comprehensive or Collision coverage.",
    },
    "gap_loan_lease_assistance": {
        "category": "auto_addons",
        "question": "What is Loan or Lease Assistance (Gap) coverage?",
        "answer": "If your vehicle is totaled, your insurance payout is based on the car's current market value — which may be less than what you still owe on your loan or lease. Loan/Lease Assistance covers that gap. It requires both Comprehensive and Collision.",
    },
    "road_trip_accommodations": {
        "category": "auto_addons",
        "question": "What is Road Trip Accident Accommodations coverage?",
        "answer": "This optional coverage pays for lodging, meals, and transportation if you are in an accident more than a set distance from home and your vehicle cannot be driven. It has a total maximum benefit per occurrence.",
    },
    "new_car_replacement": {
        "category": "auto_addons",
        "question": "What is New Car Replacement coverage?",
        "answer": "If your brand-new vehicle is totaled, New Car Replacement pays to replace it with a new vehicle of the same make and model rather than paying only the depreciated value. It requires Comprehensive and Collision and is available for current or future model year vehicles.",
    },
    "accidental_death_dismemberment": {
        "category": "auto_addons",
        "question": "What is Accidental Death & Dismemberment (AD&D) coverage?",
        "answer": "AD&D provides a benefit if you or a covered family member dies or loses a limb as a direct result of a covered auto accident. It is not available in all states.",
    },
    "medical_expense_coverage": {
        "category": "auto_addons",
        "question": "What is Medical Expense coverage on my auto policy?",
        "answer": "Medical Expense coverage pays for medical bills for you and your passengers after an accident, regardless of fault. It is separate from your health insurance and can cover co-pays, deductibles, and immediate treatment costs.",
    },
    "personal_injury_protection_pip": {
        "category": "auto_addons",
        "question": "What is Personal Injury Protection (PIP)?",
        "answer": "PIP is a broader form of no-fault coverage required in certain states. It covers medical expenses, lost wages, and sometimes funeral costs for you and your passengers regardless of who caused the accident. In states where PIP is available, it generally cannot be combined with Medical Expense coverage.",
    },

    # 🚗 APEX Auto — Premium & Navigation
    "auto_premium_change_reason": {
        "category": "auto_premium_nav",
        "question": "Why did my premium change when I modified a coverage?",
        "answer": "Your premium is calculated based on the combination of all coverages, limits, deductibles, and your personal rating factors. Increasing a limit or adding a coverage raises the premium; decreasing a limit or removing a coverage lowers it.",
    },
    "auto_recalculate_rate": {
        "category": "auto_premium_nav",
        "question": "How do I recalculate my rate after making changes?",
        "answer": "After modifying any coverage, click the \"Calculate new rate\" button to see your updated premium. The page will not automatically refresh until you trigger a recalculation.",
    },
    "monthly_vs_full_payment": {
        "category": "auto_premium_nav",
        "question": "What is the difference between paying monthly and paying in full?",
        "answer": "Paying in full (one payment) typically results in a lower total cost because installment fees are not applied. Monthly payments spread the cost over 12 installments but may include a per-installment fee.",
    },
    "fees_and_surcharges": {
        "category": "auto_premium_nav",
        "question": "What fees and surcharges are included in my premium?",
        "answer": "Your quoted premium includes state-mandated fees, surcharges, and applicable taxes. These are itemized in the payment breakdown section of your quote.",
    },
    "auto_premium_calculation_factors": {
        "category": "auto_premium_nav",
        "question": "What information was used to calculate my premium?",
        "answer": "Your premium is based on factors including your vehicle(s), driver history, credit-based insurance score (where permitted), prior insurance history, coverage selections, and your location. Click \"Here's some of the information we used\" on the coverage page for a summary.",
    },
    "edit_vehicle_driver_info": {
        "category": "auto_premium_nav",
        "question": "How do I go back and change my vehicle or driver information?",
        "answer": "Use the \"Edit\" or \"Edit details\" link on the coverage page to return to earlier steps in the quote flow and update vehicle or driver information. Your coverage selections will be preserved.",
    },
    "remove_unwanted_coverage": {
        "category": "auto_premium_nav",
        "question": "Can I remove a coverage I do not want?",
        "answer": "Yes. Most optional coverages can be set to \"No Coverage\" or \"Not Included.\" Required coverages (such as Bodily Injury and Property Damage) cannot be removed.",
    },
    "rate_did_not_update": {
        "category": "auto_premium_nav",
        "question": "I made a change but my rate did not update — what should I do?",
        "answer": "Click the \"Calculate new rate\" button to trigger a recalculation. If the rate still does not update, try refreshing the page. If the issue persists, contact our support team.",
    },
    "save_quote_come_back": {
        "category": "auto_premium_nav",
        "question": "Can I save my quote and come back later?",
        "answer": "Yes. Your quote is saved automatically. You can return using the same link or by logging into your account to resume where you left off.",
    },
    "next_step_after_coverages": {
        "category": "auto_premium_nav",
        "question": "What happens after I select my coverages — what is the next step?",
        "answer": "After finalizing your coverages, you will proceed to review your quote details, confirm your information, and complete the purchase. You will be asked to provide payment information and agree to policy terms before your policy is issued.",
    },
    "auto_underwriting_company": {
        "category": "auto_premium_nav",
        "question": "Who is the insurance company underwriting my auto policy?",
        "answer": "Your APEX Auto policy is underwritten by Midvale Indemnity Company, an American Family Insurance company.",
    },

    # 🏠 APEX Home — Core Coverages & Deductibles
    "dwelling_coverage_a": {
        "category": "home_core",
        "question": "What is Dwelling coverage (Coverage A) and how is the amount determined?",
        "answer": "Dwelling coverage pays to repair or rebuild your home's structure if it is damaged by a covered peril. The amount is based on the estimated replacement cost to rebuild your home — not its market value or what you paid for it.",
    },
    "other_structures_b": {
        "category": "home_core",
        "question": "What is Other Structures coverage (Coverage B)?",
        "answer": "Other Structures covers detached structures on your property such as a detached garage, fence, shed, or gazebo. It is typically set at 10% of your Dwelling coverage amount.",
    },
    "increase_other_structures": {
        "category": "home_core",
        "question": "Can I increase my Other Structures coverage limit?",
        "answer": "Yes. If you have significant detached structures (e.g., a large workshop or multiple outbuildings), you can increase the Other Structures limit in $1,000 increments up to the maximum allowed.",
    },
    "personal_property_c": {
        "category": "home_core",
        "question": "What is Personal Property coverage (Coverage C)?",
        "answer": "Personal Property covers your belongings — furniture, clothing, electronics, appliances, and other items — if they are damaged, destroyed, or stolen. The default is a percentage of your Dwelling coverage.",
    },
    "replacement_cost_vs_depreciated_value": {
        "category": "home_core",
        "question": "Should I choose \"Replacement Cost\" or \"Depreciated Value\" for my personal property?",
        "answer": "Replacement Cost pays to replace your items with new ones of similar kind and quality. Depreciated Value (Actual Cash Value) pays what your items are worth today, accounting for age and wear. Replacement Cost provides more complete protection but costs more.",
    },
    "loss_of_use_d": {
        "category": "home_core",
        "question": "What is Loss of Use coverage (Coverage D)?",
        "answer": "Loss of Use (also called Additional Living Expenses) pays for temporary housing, meals, and other living costs if your home becomes uninhabitable due to a covered loss. The standard limit is $150,000.",
    },
    "personal_liability_e": {
        "category": "home_core",
        "question": "What is Personal Liability coverage (Coverage E)?",
        "answer": "Personal Liability protects you if someone is injured on your property or if you accidentally damage someone else's property. It covers legal defense costs and judgments up to your selected limit ($100,000, $300,000, or $500,000).",
    },
    "medical_payments_f": {
        "category": "home_core",
        "question": "What is Medical Payments to Others coverage (Coverage F)?",
        "answer": "Medical Payments to Others pays for minor medical expenses if a guest is injured on your property, regardless of fault. It is a goodwill coverage with limits of $1,000, $3,000, or $5,000.",
    },
    "aop_all_perils_deductible": {
        "category": "home_deductibles",
        "question": "What is the All-Perils (AOP) deductible?",
        "answer": "The AOP (All Other Perils) deductible is the amount you pay out of pocket before your insurance covers a claim for most covered losses. Common options range from $500 to $5,000.",
    },
    "wind_hail_deductible": {
        "category": "home_deductibles",
        "question": "What is a Wind/Hail deductible and how is it different from my standard deductible?",
        "answer": "A Wind/Hail deductible applies specifically to damage caused by windstorms or hail. In many states it is a mandatory separate deductible, often expressed as a percentage of your Dwelling coverage (e.g., 1% or 2% of Coverage A). It must be equal to or greater than your AOP deductible.",
    },
    "hurricane_deductible": {
        "category": "home_deductibles",
        "question": "What is a Hurricane deductible?",
        "answer": "A Hurricane deductible applies specifically to damage caused by a named hurricane. It is required in certain coastal and hurricane-prone states and is typically expressed as a percentage of your Dwelling coverage.",
    },
    "home_deductible_vs_premium": {
        "category": "home_deductibles",
        "question": "How do I decide between a higher deductible and a lower premium?",
        "answer": "A higher deductible reduces your premium but means you pay more out of pocket when you file a claim. If you have an emergency fund that can cover a higher deductible, it can lower your annual cost. If you prefer predictable out-of-pocket expenses, a lower deductible is safer.",
    },

    # 🏠 APEX Home — Optional / Add-On Coverages
    "extended_replacement_cost": {
        "category": "home_addons",
        "question": "What is Extended Replacement Cost coverage?",
        "answer": "Extended Replacement Cost provides an additional buffer (25% or 50% of your Dwelling coverage) above your Coverage A limit if rebuilding costs exceed your estimate due to inflation or increased material costs after a major loss.",
    },
    "water_backup_coverage": {
        "category": "home_addons",
        "question": "What is Water Backup coverage and do I need it?",
        "answer": "Water Backup covers damage caused by water backing up through sewers or drains, or by a sump pump overflow. Standard homeowners policies typically exclude this. It is available in limits from $5,000 to $25,000 depending on your state.",
    },
    "service_line_coverage": {
        "category": "home_addons",
        "question": "What is Service Line coverage?",
        "answer": "Service Line coverage pays to repair or replace underground utility lines (water, sewer, electrical, gas, internet) that run from the street to your home if they are damaged. These lines are typically your responsibility as a homeowner and are not covered by the utility company.",
    },
    "equipment_breakdown_coverage": {
        "category": "home_addons",
        "question": "What is Equipment Breakdown coverage?",
        "answer": "Equipment Breakdown covers the sudden and accidental mechanical or electrical failure of home systems and appliances — such as your HVAC, water heater, refrigerator, or washer/dryer. It is different from a home warranty and covers the cost of repair or replacement.",
    },
    "earthquake_coverage": {
        "category": "home_addons",
        "question": "What is Earthquake coverage and should I add it?",
        "answer": "Earthquake coverage pays for damage to your home caused by an earthquake. It is not included in a standard homeowners policy. The deductible is typically 5% or 10% of your Dwelling coverage depending on your location's seismic risk zone.",
    },
    "ordinance_of_law": {
        "category": "home_addons",
        "question": "What is Ordinance of Law coverage?",
        "answer": "Ordinance of Law coverage pays the additional cost to bring your home up to current building codes when it is being repaired or rebuilt after a covered loss. Without it, you may have to pay out of pocket for code-required upgrades.",
    },
    "identity_fraud_expense": {
        "category": "home_addons",
        "question": "What is Identity Fraud / Theft Expense coverage?",
        "answer": "This optional coverage reimburses you for expenses incurred as a result of identity theft — such as legal fees, lost wages, and costs to restore your credit. It is available as an add-on to your home policy.",
    },
    "scheduled_personal_property": {
        "category": "home_addons",
        "question": "What is Scheduled Personal Property (Jewelry) coverage?",
        "answer": "Standard Personal Property coverage has sub-limits for high-value items like jewelry, watches, and fine art. Scheduled Personal Property coverage allows you to insure specific high-value items for their full appraised value, typically in $1,000 increments up to $10,000.",
    },
    "standard_vs_extended_incidents": {
        "category": "home_addons",
        "question": "What is the difference between \"Standard Incidents\" and \"Extended Incidents\" for personal property?",
        "answer": "Standard Incidents covers your belongings against a defined list of named perils (fire, theft, vandalism, etc.). Extended Incidents provides broader, open-perils coverage that covers all causes of loss except those specifically excluded — offering more comprehensive protection.",
    },
    "mold_property_protection": {
        "category": "home_addons",
        "question": "What is Mold Property Protection coverage?",
        "answer": "Mold Property Protection covers the cost to remediate mold damage to your home's structure. It is available in certain states (FL, GA, LA, MA, MS, NJ) where mold risk is elevated, with limits of $10,000 or $25,000.",
    },
    "mine_subsidence_coverage": {
        "category": "home_addons",
        "question": "What is Mine Subsidence coverage?",
        "answer": "Mine Subsidence coverage protects against structural damage caused by the collapse of underground mines beneath your property. It is available in states with significant underground mining history.",
    },
    "animal_liability_coverage": {
        "category": "home_addons",
        "question": "What is Animal Liability coverage?",
        "answer": "Animal Liability coverage extends your personal liability protection to cover injuries or property damage caused by your pets. It is available in certain states (CA, FL) with standard or high-risk ($25,000) options.",
    },
    "pool_liability_coverage": {
        "category": "home_addons",
        "question": "What is Pool Liability coverage?",
        "answer": "Pool Liability provides additional liability protection specifically for injuries that occur in or around your swimming pool. It is available in certain states (CA, FL) with a $25,000 limit.",
    },
    "personal_injury_libel_coverage": {
        "category": "home_addons",
        "question": "What is Personal Injury (Libel) coverage?",
        "answer": "Personal Injury coverage extends your liability protection to cover claims of libel, slander, defamation, or invasion of privacy — situations not typically covered under standard personal liability.",
    },

    # 🏠 APEX Home — Premium & Navigation
    "home_dwelling_premium_impact": {
        "category": "home_premium_nav",
        "question": "Why did my home insurance premium change when I adjusted my Dwelling coverage?",
        "answer": "Your Dwelling coverage is the foundation of your home policy. Increasing it raises the premium because the insurer's maximum exposure increases. It also affects other coverages calculated as a percentage of Coverage A (such as Other Structures and Loss of Use).",
    },
    "home_policy_discounts": {
        "category": "home_premium_nav",
        "question": "What discounts are available on my home policy?",
        "answer": "Common discounts include the multi-product discount (bundling auto and home), partner affinity discounts, and protective device discounts. Your quote will reflect all applicable discounts automatically.",
    },
    "how_bundling_saves_money": {
        "category": "home_premium_nav",
        "question": "How does bundling my home and auto policies save me money?",
        "answer": "When you purchase both an auto and home policy together, a multi-product discount is applied to both policies. This is one of the most significant discounts available and can result in meaningful savings on your total insurance cost.",
    },
    "home_premium_factors": {
        "category": "home_premium_nav",
        "question": "What information was used to calculate my home insurance premium?",
        "answer": "Your premium is based on factors including your home's replacement cost estimate, construction type, age, location, claims history, coverage selections, and applicable discounts.",
    },
    "home_underwriting_company": {
        "category": "home_premium_nav",
        "question": "Who is the insurance company underwriting my home policy?",
        "answer": "Your APEX Home policy is underwritten by Homesite Insurance, an American Family Insurance company.",
    },
    "home_replacement_cost_determined": {
        "category": "home_premium_nav",
        "question": "How is my home's replacement cost value determined?",
        "answer": "The replacement cost is estimated based on your home's characteristics — square footage, construction type, age, number of stories, and local building costs. It reflects what it would cost to rebuild your home from the ground up, not its market value.",
    },
    "rebuild_cost_exceeds_limit": {
        "category": "home_premium_nav",
        "question": "What happens if my home's actual rebuild cost exceeds my Coverage A limit?",
        "answer": "If rebuilding costs exceed your Coverage A limit, Extended Replacement Cost coverage provides an additional buffer (25% or 50% of Coverage A). Without it, you would be responsible for costs above your limit.",
    },
    "change_effective_date": {
        "category": "home_premium_nav",
        "question": "Can I change my policy effective date?",
        "answer": "Yes. You can adjust your policy start date during the quote process. Coverage availability and pricing are based on the effective date you select.",
    },
    "next_step_after_home_coverages": {
        "category": "home_premium_nav",
        "question": "What is the next step after I finalize my home coverages?",
        "answer": "After selecting your coverages, you will review your full quote, confirm your property and personal information, and complete the purchase by providing payment details and agreeing to policy terms.",
    },

    # 🔗 Bundling & General Policy Questions
    "quote_auto_home_together": {
        "category": "bundling_general",
        "question": "Can I quote both auto and home insurance together?",
        "answer": "Yes. You can quote an Auto + Home bundle in a single flow. Bundling qualifies you for a multi-product discount on both policies.",
    },
    "difference_apex_auto_and_home": {
        "category": "bundling_general",
        "question": "What is the difference between APEX Auto and APEX Home — are they the same company?",
        "answer": "APEX Auto is underwritten by Midvale Indemnity Company and APEX Home is underwritten by Homesite Insurance. Both are American Family Insurance companies and are offered together as a bundle on this platform.",
    },
    "add_vehicles_or_properties": {
        "category": "bundling_general",
        "question": "Can I add more vehicles or additional properties to my quote?",
        "answer": "Yes. You can add multiple vehicles to your auto quote. For additional properties, please contact our support team or an agent.",
    },
    "payment_methods_accepted": {
        "category": "bundling_general",
        "question": "What payment methods are accepted?",
        "answer": "You can pay by credit card, debit card, or bank account (EFT). Both full payment (one-pay) and monthly installment options are available.",
    },
    "confirmation_after_purchase": {
        "category": "bundling_general",
        "question": "Will I receive confirmation after I purchase my policy?",
        "answer": "Yes. A confirmation email will be sent to the address on file after your policy is issued. You will also be enrolled in paperless delivery and auto-pay through your online account.",
    },
    "changes_after_purchase": {
        "category": "bundling_general",
        "question": "What if I need to make changes to my policy after I purchase it?",
        "answer": "After purchase, you can manage your policy through your online account or by contacting our customer service team. Changes to coverage after binding may affect your premium.",
    },
    "does_not_qualify_dnq": {
        "category": "bundling_general",
        "question": "What does it mean if I receive a \"Does Not Qualify\" (DNQ) message?",
        "answer": "A DNQ message means that based on the information provided, we are unable to offer you a policy through this platform at this time. Our team may be able to assist you with alternative options — please contact us for guidance.",
    },
    "is_quote_saved_if_leave": {
        "category": "bundling_general",
        "question": "Is my quote saved if I leave the page?",
        "answer": "Yes. Your quote is automatically saved. You can return to it using the same link or by logging into your account.",
    },
}


def lookup_coverage_faq(
    question_key: str,
    category: str = "",
    user_query: str = ""
) -> Dict[str, Any]:
    """Retrieves the exact canonical American Family Insurance FAQ answer.

    Args:
        question_key: The canonical key for the FAQ question (REQUIRED). Examples:
            'bodily_injury_liability', 'property_damage_liability', 'bodily_injury_limits_100_300',
            'how_much_liability_needed', 'uninsured_motorist_um', 'underinsured_motorist_uim',
            'reject_um_uim', 'difference_um_uim', 'comprehensive_coverage', 'collision_coverage',
            'difference_comprehensive_collision', 'how_to_choose_deductible',
            'collision_deductible_rate_impact', 'rental_reimbursement', 'roadside_assistance_era',
            'oem_parts_coverage', 'gap_loan_lease_assistance', 'road_trip_accommodations',
            'new_car_replacement', 'accidental_death_dismemberment', 'medical_expense_coverage',
            'personal_injury_protection_pip', 'auto_premium_change_reason', 'auto_recalculate_rate',
            'monthly_vs_full_payment', 'fees_and_surcharges', 'auto_premium_calculation_factors',
            'edit_vehicle_driver_info', 'remove_unwanted_coverage', 'rate_did_not_update',
            'save_quote_come_back', 'next_step_after_coverages', 'auto_underwriting_company',
            'dwelling_coverage_a', 'other_structures_b', 'increase_other_structures',
            'personal_property_c', 'replacement_cost_vs_depreciated_value', 'loss_of_use_d',
            'personal_liability_e', 'medical_payments_f', 'aop_all_perils_deductible',
            'wind_hail_deductible', 'hurricane_deductible', 'home_deductible_vs_premium',
            'extended_replacement_cost', 'water_backup_coverage', 'service_line_coverage',
            'equipment_breakdown_coverage', 'earthquake_coverage', 'ordinance_of_law',
            'identity_fraud_expense', 'scheduled_personal_property', 'standard_vs_extended_incidents',
            'mold_property_protection', 'mine_subsidence_coverage', 'animal_liability_coverage',
            'pool_liability_coverage', 'personal_injury_libel_coverage', 'home_dwelling_premium_impact',
            'home_policy_discounts', 'how_bundling_saves_money', 'home_premium_factors',
            'home_underwriting_company', 'home_replacement_cost_determined',
            'rebuild_cost_exceeds_limit', 'change_effective_date', 'next_step_after_home_coverages',
            'quote_auto_home_together', 'difference_apex_auto_and_home', 'add_vehicles_or_properties',
            'payment_methods_accepted', 'confirmation_after_purchase', 'changes_after_purchase',
            'does_not_qualify_dnq', 'is_quote_saved_if_leave'.
        category: Optional insurance category filter (e.g. 'auto_liability', 'auto_physical_damage',
            'auto_addons', 'auto_premium_nav', 'home_core', 'home_deductibles', 'home_addons',
            'home_premium_nav', 'bundling_general').
        user_query: Optional original customer phrasing for logging and fallback resolution.

    Returns:
        dict: A structured dictionary containing:
            - 'status': 'success' or 'not_found'
            - 'question_key': the matched key
            - 'question': the official question text
            - 'exact_answer': the exact verbatim answer string
            - 'action': instructions directing the agent to output exact_answer verbatim
    """
    clean_key = (question_key or "").strip().lower()

    if clean_key in FAQ_DATABASE:
        faq_item = FAQ_DATABASE[clean_key]
        return {
            "status": "success",
            "question_key": clean_key,
            "category": faq_item["category"],
            "question": faq_item["question"],
            "exact_answer": faq_item["answer"],
            "action": "Output the exact_answer text VERBATIM. Do not modify, summarize, or add conversational preamble.",
        }

    # Fallback key matching for normalized or underscored keys
    normalized_key = clean_key.replace("-", "_").replace(" ", "_")
    if normalized_key in FAQ_DATABASE:
        faq_item = FAQ_DATABASE[normalized_key]
        return {
            "status": "success",
            "question_key": normalized_key,
            "category": faq_item["category"],
            "question": faq_item["question"],
            "exact_answer": faq_item["answer"],
            "action": "Output the exact_answer text VERBATIM. Do not modify, summarize, or add conversational preamble.",
        }

    # Substring search across keys if key was slightly misformatted
    for k, v in FAQ_DATABASE.items():
        if k in normalized_key or normalized_key in k:
            return {
                "status": "success",
                "question_key": k,
                "category": v["category"],
                "question": v["question"],
                "exact_answer": v["answer"],
                "action": "Output the exact_answer text VERBATIM. Do not modify, summarize, or add conversational preamble.",
            }

    # If not found in FAQ database
    return {
        "status": "not_found",
        "question_key": clean_key,
        "error": f"No exact FAQ found for key '{question_key}'.",
        "agent_action": "Inform the customer politely that this specific question is not covered in the FAQ guide, and offer to connect them with a licensed agent via escalate_to_agent.",
    }
